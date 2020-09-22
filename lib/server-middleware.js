import path from 'path';
import fetchNavigations from './fetch-navigations';

export default (options) => {
    return async (req, res, next) => {
        const navigationsFilePath = path.resolve('.nuxt/hatchly-navigation/navigations.json');

        const { navigations } = require(navigationsFilePath);

        if (!navigations.length) {
            await fetchNavigations(options);
        } else {
            fetchNavigations(options);
        }

        next();
    };
};
