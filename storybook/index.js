import { registerStoreModule, registerGlobalMixin } from '../lib/plugin';

/**
 * Init the store and globals and setup the navigations fixture.
 *
 * @param {object} config
 * @param {object} config.store
 * @param {Array} config.navs
 */
export default ({ store, navs }) => {
    registerStoreModule(store);
    registerGlobalMixin();

    store.commit('navigations/set', navs);
};
