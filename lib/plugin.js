import Vue from 'vue';
import { navigations } from './navigations.json';

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

    app.store.commit('navigations/set', navigations);

    registerGlobalMixin();
};
