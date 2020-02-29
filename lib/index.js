import { resolve } from 'path';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function NavigationModule(moduleOptions = {}) {
    const hatchlyOptions = {
        apiPath: '_hatchly/api',
        ...this.options.hatchly || {},
    };

    const options = {
        apiBase: process.env.API_BASE,
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

    options.apiUrl = options.apiUrl
        || `${ options.apiBase }/${ options.apiPath }`;

    this.addTemplate({
        src: resolve(__dirname, './logger.js'),
        fileName: './hatchly-navigation/logger.js',
    });

    const plugin = this.addTemplate({
        src: resolve(__dirname, './plugin.js'),
        fileName: './hatchly-navigation/plugin.js',
        options,
    });

    this.options.plugins.push(resolve(this.options.buildDir, plugin.dst));
}
