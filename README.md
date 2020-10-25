# Nuxt Hatchly Navigation Module

> Module to easily fetch and access navigations from the `hatchly/navigation` api

## Installation

```bash
yarn add @hatchly/nuxt-navigation-module
```

Register the module in your nuxt applications config file:

```js
module.exports = {
    // Nuxt config
    modules: {
        // Other Modules
        ['@hatchly/nuxt-navigation-module', {
            // Options
        }],
    },

    hatchly: {
        navigation: {
            // Options can also be defined here
        },
    },
};
```

Add the API url to your .env:

```
API_URL=http://my-application.localhost
```

## Options

The options object can contain the following values: 

```js
{
    baseURL: '',
    browserBaseURL: '',
    apiPath: '',
},
```

Each option is described below.

### `baseURL`

> The url of your Hatchly site. If `browserBaseURL` is not provided this url will be used for both server side and client side fetching.

- Default: `process.env.API_URL`
- Type: `string`

### `browserBaseURL`

> The public url of your Hatchly site. 

- Default: `process.env.API_URL_BROWSER`
- Type: `string`

### `apiPath`

> The path to the api modules `hatchly-path` value. This can be modified in the Hatchly api config file, so make sure this path corresponds to that value.

- Default: `'_hatchly/api'`
- Alias: `hatchly.apiPath`
- Type: `string`

### Runtime config

If using nuxt runtime config to inject env variables at runtime, each of the above options can be overwritten in both `publicRuntimeConfig` and `privateRuntimeConfig` objects, for example:

```js
module.exports = {
    publicRuntimeConfig: {
        hatchly: {
            // Inherit options for all hatchly modules
            baseURL: process.env.API_URL,
            
            navigation: {
                // Overwrite options for the navigation module
                baseURL: process.env.API_URL,
            },
        },    
    },
};
```

## Usage

All navigations are downloaded server side on page load.

To access a navigation you can use the global `$nav()` method:

```vue
<ul v-if="$nav('main')">
    <li v-for="link in $nav('main')" :key="link.id">
        <component :is="link.tag" v-bind="link.attributes">
            {{ link.title }}
        </component>
        <ul>
            <li v-for="child in link.children" :key="child.id">
                <component :is="child.tag" v-bind="child.attributes">
                    {{ child.title }}
                </component>
            </li>
        </ul>
    </li>
</ul>
```

## Storybook

This module exposes a storybook integration to add the `$nav` global and the store module. Simply pull the following module into your project and register your navigations, in the `preview.js` file for example:

```js
import hatchlyNavigation from '@hatchly/nuxt-navigation-module/storybook';
import { navs } from './fixtures/navs';
import store from './store';

hatchlyNavigation({
    store,
    navs,
});
```
