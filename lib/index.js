import { resolve } from 'path';
import logger from './logger';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function NavigationModule(moduleOptions = {}) {
    const { nuxt } = this;

    const hatchlyOptions = {
        apiPath: '_hatchly/api',
        ...this.options.hatchly || {},
    };

    const options = {
        apiUrl: process.env.API_URL,
        browserApiUrl: process.env.API_URL_BROWSER,
        cacheTimeout: (24 * 60) * 60, // 24 hours default
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).navigation || {},
    };

    if (!options.cacheTimeout) {
        logger.info('Falsey cacheTimeout provided, cache will not be used.');
    }

    if (options.apiPath.endsWith('/')) {
        options.apiPath = options.apiPath
            .split('/')
            .slice(0, -1)
            .join('/');
    }

    if (options.apiPath.startsWith('/')) {
        const parts = options.apiPath.split('/');
        parts.unshift();
        options.apiPath = parts.join('/');
    }

    nuxt.options.publicRuntimeConfig.hatchly = {
        ...nuxt.options.publicRuntimeConfig.hatchly,
        navigations: {
            apiUrl: process.env.API_URL_BROWSER || '${API_URL_BROWSER}',
        },
    };

    nuxt.options.privateRuntimeConfig.hatchly = {
        ...nuxt.options.privateRuntimeConfig.hatchly,
        navigations: {
            apiUrl: process.env.API_URL || '${API_URL}',
        },
    };

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-navigation/logger.js',
    });

    const { dst } = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-navigation/plugin.js',
        options,
    });

    this.options.plugins.push(resolve(this.options.buildDir, dst));
}
