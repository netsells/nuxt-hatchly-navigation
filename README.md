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
API_BASE=http://my-application.localhost
```

## Options

The options object can contain the following values: 

```js
{
    apiBase: '',
    apiPath: '',
    apiUrl: '',
},
```

Each option is described below.

### `apiBase`

> The url of your Hatchly site. This is should be updated in your .env rather than hardcoding a value here.

- Default: `process.env.API_BASE`
- Type: `string`

### `apiPath`

> The path to the api modules `hatchly-path` value. This can be modified in the Hatchly api config file, so make sure this path corresponds to that value.

- Default: `'_hatchly/api'`
- Alias: `hatchly.apiPath`
- Type: `string`

### `apiUrl`

> The full api url prefix for hatchly-api routes. By default this is made up of the `apiBase` and the `apiUrl`, but can be overwritten in full.

- Default: `${ process.env.API_BASE }/_hatchly/api`
- Type: `string`

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

