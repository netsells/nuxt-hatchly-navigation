import fs from 'fs';
import axios from 'axios';
import path from 'path';

let pluginOptions = {};

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
        .replace(pluginOptions.baseURL, '')
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
 * Fetch the navigations from the API and store them as json.
 *
 * @param {object} options
 *
 * @returns {Promise<{navigations: *[]}>}
 */
export default async function fetchNavigations(options) {
    pluginOptions = options;

    const navigationsFilePath = path.resolve('.nuxt/hatchly-navigation/navigations.json');

    const axiosClient = axios.create({
        baseURL: options.apiURL,
    });

    const { data: { data } } = await axiosClient.get('navigation/groups');

    const requests = data.map(({ key }) =>
        axiosClient.get(`navigation/groups/${ key }/items`),
    );

    const navigations = (await Promise.all(requests))
        .map(({ data }) => data);

    navigations.forEach((nav, i) => {
        // To handle older version of the API which return children in an object
        const items = Array.isArray(nav.data)
            ? nav.data
            : Object.values(nav.data);

        data[i].items = items.map(navItemFormatter);
    });

    const existingJson = fs.readFileSync(navigationsFilePath, 'utf-8');
    const json = JSON.stringify({ navigations: data }, null, 4);

    if (existingJson !== json) {
        fs.writeFileSync(navigationsFilePath, json);
    }

    return { navigations };
}
