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
    cacheTimeout: '',
},
```

Each option is described below.

### `cacheTimeout`

> The duration, in seconds, until the cached date is refreshed. The cache can be disabled completely by passing a falsey value. 

- Default: `86400` (24 hours)
- Type: `number|boolean`

### Runtime config

By default, this package will utilise `API_URL` and `API_URL_BROWSER` variables as defined in your env. These are injected as runtime variables for you.

You can supply your endpoint manually to the module via the `publicRuntimeConfig` and `privateRuntimeConfig` objects, e.g.:

```js
module.exports = {
    publicRuntimeConfig: {
        hatchly: {
            navigation: {
                // Overwrite options for the snippets module
                endpoint: process.env.NAVIGATIONS_API_URL,
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
