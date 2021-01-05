import { resolve } from 'path';
import logger from './logger';

/**
 * Register the module.
 *
 * @param {object} moduleOptions
 */
export default function NavigationModule(moduleOptions = {}) {
    const hatchlyOptions = {
        ...this.options.hatchly || {},
    };

    const options = {
        cacheTimeout: (24 * 60) * 60, // 24 hours default
        ...hatchlyOptions,
        ...moduleOptions,
        ...(this.options.hatchly || {}).navigation || {},
    };

    if (!options.cacheTimeout) {
        logger.info('Falsey cacheTimeout provided, cache will not be used.');
    }

    this.options.publicRuntimeConfig.hatchly = {
        ...this.options.publicRuntimeConfig.hatchly,
        navigation: {
            endpoint: `${ process.env.API_URL_BROWSER || process.env.API_URL }/_hatchly/api/navigation`,
            ...(this.options.publicRuntimeConfig.hatchly || {}).navigation,
        },
    };

    this.options.privateRuntimeConfig.hatchly = {
        ...this.options.privateRuntimeConfig.hatchly,
        navigation: {
            endpoint: `${ process.env.API_URL }/_hatchly/api/navigation`,
            ...(this.options.privateRuntimeConfig.hatchly || {}).navigation,
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
