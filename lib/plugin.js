import Vue from 'vue';
import logger from './logger';

const config = <%= JSON.stringify(options) %>;
let navigations = [];

/**
 * Format the nav url.
 *
 * @param {string} url
 *
 * @returns {string}
 */
const urlFormatter = (url) => {
    return (url || '')
        // As the urls come from an api, the urls will have the
        // api url as the base. We'll remove this
        .replace(config.baseURL, '')
        // If the url was the homepage, we'll default to a slash
        || '/';
};

/**
 * Recursively Format each nav item so it's more usable.
 *
 * @param {object} item
 *
 * @returns {{children: *, url: *}}
 */
const navItemFormatter = (item) => {
    const url = urlFormatter(item.url);
    const internal = url.startsWith('/');

    // To handle older version of the API which return children in an object
    const children = Array.isArray(item.children)
        ? item.children
        : Object.values(item.children);

    return {
        ...item,
        url,
        tag: internal
            ? 'nuxt-link'
            : 'a',
        attributes: {
            [internal ? 'to' : 'href']: url,
            target: item.target,
        },
        children: children.map(navItemFormatter),
    };
};

/**
 * Run the call to fetch the navigations from the API.
 *
 * @param {Function} dispatch
 *
 * @returns {Promise<*>}
 */
const fetchNavigations = async ({ dispatch }) => {
    try {
        return await dispatch('navigations/get');
    } catch (e) {
        if (e.response && e.response.status === 404) {
            logger.error(`Module is not installed at [${ config.apiURL }].`);
            return;
        }

        logger.error(`Module at [${ config.apiURL }] returned an error.`);
        logger.error(new Error(e));
    }
};

/**
 * Register the Vuex module to fetch the navigations.
 *
 * @param {object} store
 */
export const registerStoreModule = (store) => {
    store.registerModule('navigations', {
        namespaced: true,

        state: () => ({
            navs: [],
        }),

        getters: {
            /**
             * Find the navigation in the store.
             *
             * @param {Array} navs
             *
             * @returns {function(*): *}
             */
            find({ navs }) {
                return (key) => navs.find((nav) => nav.key === key);
            },
            foo() {
                return 'bar';
            },
        },

        mutations: {
            /**
             * Set the data in the store.
             *
             * @param {object} state
             * @param {Array} data
             */
            set(state, data) {
                state.navs = data;
            },
        },

        actions: {
            /**
             * Fetch the navigation data from the api.
             *
             * @param {Function} commit
             *
             * @returns {Promise<void>}
             */
            async get({ commit }) {
                const { data } = await this.$axios.$get(`${ config.apiURL }/navigation/groups`);

                const requests = data.map(({ key}) =>
                    this.$axios.$get(`${ config.apiURL }/navigation/groups/${ key }/items`),
                );

                const result = await Promise.all(requests);

                result.forEach((nav, i) => {
                    // To handle older version of the API which return children in an object
                    const items = Array.isArray(nav.data)
                        ? nav.data
                        : Object.values(nav.data);

                    data[i].items = items.map(navItemFormatter);
                });

                return data;
            },
        },
    });
};

/**
 * Register the global mixin to allow access to navigations.
 */
export const registerGlobalMixin = () => {
    Vue.mixin({
        methods: {
            /**
             * Find a nav by key.
             *
             * @param {string} key
             *
             * @returns {Array}
             */
            $nav(key) {
                const find = this.$store.getters['navigations/find'];

                const nav = find(key);

                return (nav || {}).items || [];
            },
        },
    });
};

/**
 * Setup the plugin.
 *
 * @param {object} context
 * @param {object} context.app
 *
 * @returns {Promise<void>}
 */
export default async function({ app }) {
    registerStoreModule(app.store);

    if (process.server) {
        if (!navigations.length) {
            navigations = await app.store.dispatch('navigations/get');
        } else {
            app.store.dispatch('navigations/get').then((data) => navigations = data);
        }

        app.store.commit('navigations/set', navigations);
    }

    registerGlobalMixin();
};
