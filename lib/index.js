import { resolve } from 'path';
import serverMiddleware from './server-middleware';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default async function NavigationModule(moduleOptions = {}) {
    const { nuxt } = this;

    const hatchlyOptions = {
        apiPath: '_hatchly/api',
        ...this.options.hatchly || {},
    };

    const options = {
        baseURL: process.env.API_URL,
        browserBaseURL: process.env.API_URL_BROWSER,
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).navigation || {},
    };

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
        navigation: {
            ...options,
            ...nuxt.options.publicRuntimeConfig.hatchly,
            ...(nuxt.options.publicRuntimeConfig.hatchly && nuxt.options.publicRuntimeConfig.hatchly.navigation),
        },
    };

    nuxt.options.privateRuntimeConfig.hatchly = {
        ...nuxt.options.privateRuntimeConfig.hatchly,
        navigation: {
            ...options,
            ...nuxt.options.privateRuntimeConfig.hatchly,
            ...(nuxt.options.privateRuntimeConfig.hatchly && nuxt.options.privateRuntimeConfig.hatchly.navigation),
        },
    };

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-navigation/logger.js',
    });

    const { dst: dest } = this.addTemplate({
        src: resolve(__dirname, './navigations.json'),
        fileName: './hatchly-navigation/navigations.json',
    });
    const fs = require('fs');
    console.log(fs.existsSync(resolve(__dirname, dest)));
    console.log(fs.existsSync(resolve(__dirname, dest)));

    const { dst } = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-navigation/plugin.js',
        options,
    });

    this.options.plugins.push(resolve(this.options.buildDir, dst));

    this.options.router.middleware.unshift('navigations');

    this.options.serverMiddleware.unshift(serverMiddleware({
        ...options,
        ...nuxt.options.privateRuntimeConfig.hatchly.navigation,
        ...nuxt.options.publicRuntimeConfig.hatchly.navigation,
        apiURL: `${ options.baseURL }/${ options.apiPath }`
    }));
}
