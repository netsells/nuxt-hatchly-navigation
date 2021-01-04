import logger from './logger';

const config = {};

<% if (options.cacheTimeout) { %>
    const cache = {
        data: [],
        timestamp: null,
    };
<% } %>

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
        .replace(config.apiUrl, '')
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
                const groupsPath = `${ config.requestUrl }/navigation/groups`;

                logger.info(`Fetching navigation groups from [${ groupsPath }]`);

                const { data } = await this.$axios.$get(groupsPath);

                const requests = data.map(({ key }) => {
                    const groupPath = `${ config.requestUrl }/navigation/groups/${ key }/items`;

                    logger.info(`Fetching [${ key }] navigation group from [${ groupPath }]`);

                    return this.$axios.$get(groupPath);
                });

                const result = await Promise.all(requests);

                result.forEach((nav, i) => {
                    // To handle older version of the API which return children in an object
                    const items = Array.isArray(nav.data)
                        ? nav.data
                        : Object.values(nav.data);

                    data[i].items = items.map(navItemFormatter);
                });

                commit('set', data);

                return data;
            },
        },
    });
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
            logger.error(`Module is not installed at [${ config.requestUrl }].`);
            return;
        }

        logger.error(`Module at [${ config.requestUrl }] returned an error.`);
        logger.error(new Error(e));
    }
};

/**
 * Register the global mixin to allow access to navigations.
 */
export const globalMixin = function(key) {
    const find = this.$store.getters['navigations/find'];

    if (!find) {
        logger.error('Find method was undefined');
        return [];
    }

    const nav = find(key);

    return (nav || {}).items || [];
};

/**
 * Setup the plugin.
 *
 * @param {object} context
 * @param {object} context.app
 * @param {object} context.$config
 * @param {function} inject
 *
 * @returns {Promise<void>}
 */
export default async function({ app, $config, route }, inject) {
    config.apiPath = '<%- options.apiPath %>';
    config.apiUrl = $config.hatchly.navigations.apiUrl;
    config.requestUrl = `${ config.apiUrl }/${ config.apiPath }`;

    registerStoreModule(app.store);

    inject('nav', globalMixin);

    if (!process.server) {
        return;
    }

    <% if (!options.cacheTimeout) { %>
        return fetchNavigations(app.store);
    <% } else { %>
        const forceClear = route.query.cache === 'clear';

        const now = () => Math.round(new Date().getTime() / 1000);
        const generateCacheTimeout = () => now() + <%- options.cacheTimeout %>;

        const request = () => fetchNavigations(app.store).then((data) => {
            cache.data = data;
            cache.timestamp = generateCacheTimeout();

            return data;
        });


        if (forceClear || !cache.timestamp || cache.timestamp <= now()) {
            if (forceClear) {
                logger.log('Cache clear was forced');
            } else if (!cache.timestamp) {
                logger.log('Populating cache for the first time');
            } else {
                logger.log('Cache expired, fetching...');
            }

            cache.data = await request();
            cache.timestamp = generateCacheTimeout();
        } else {
            logger.log('Using cached data');
            app.store.commit('navigations/set', cache.data);
        }
    <% } %>
};
