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
        baseUrl: process.env.API_URL,
        browserBaseUrl: process.env.API_URL_BROWSER,
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
