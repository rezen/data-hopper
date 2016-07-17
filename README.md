## data-hopper
[![NPM Version][npm-image]][npm-url] <br />

## About
It's not uncommon on a project to have multiple datastores. This project makes it easy to store all your datastore connections
in one easy accessible place. A number of drivers are builtin by default to support the most popular datastores.

## Install
`npm install data-hopper`

#### Drivers
- Elasticsearch
- Mongodb
- MySql
- Postgres
- Redis
- Sqlite


## Example
```js
'use strict';

const DataHopper = require('data-hopper');

const hopper = DataHopper();

/**
 * Name connection and pass in the config
 */
hopper.load('kittens', {
  driver: 'sqlite',
  filename: __dirname + './meow.sqlite'
});

// Get the connection off the hopper
const kittens = hopper.get('kittens');

kittens.schema.createTableIfNotExists('meows', function(table) {
  table.increments('id');
  table.string('name');
}).then(function() {
  return kittens.insert({name: 'Fluffy'}).into('meows');
});

console.log(hopper.info('cache'));
```

Adding drivers is quite trivial, below is an example with the 
npm module `nedb`

```js
'use strict';

const Nedb       = require('nedb');
const DataHopper = require('data-hopper');

const hopper = DataHopper();

hopper.useDriver({
  label: 'nedb',
  configure(config) {
    config = config || {};
    config.autoload = true;
    return config;
  },
  start(config) {
    return new Nedb(config);
  }
});

hopper.load('blog', {
  driver: 'nedb',
  timestampData: true
});
```

[npm-image]: https://img.shields.io/npm/v/data-hopper.svg
[npm-url]: https://npmjs.org/package/data-hopper

