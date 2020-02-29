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


