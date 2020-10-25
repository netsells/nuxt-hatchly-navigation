import Vue from 'vue';
import { registerStoreModule, registerGlobalMixin } from '../lib/plugin';

registerStoreModule(Vue.prototype.$store);
registerGlobalMixin();

export const setNavigations = (navs) => {
    Vue.prototype.$store.commit('navs/set', navs);
};
