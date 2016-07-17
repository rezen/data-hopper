'use strict';

const DataHopper = require('../index');

const hopper = DataHopper();

/**
 * Hacks the requires so that you can
 * directly require the connection
 */
hopper.hack();

/**
 * Name connection and pass in the config
 */
hopper.load('kittens', {
  driver: 'sqlite',
  filename: __dirname + './meow.sqlite'
});

var kittens;

// Get the connection off the hopper
kittens = hopper.get('kittens');

// Require the connection since hack is enabled
kittens = require('data-hopper/conn/kittens');

var name;

kittens.schema.createTableIfNotExists('meows', (table) => {
  table.increments('id');
  table.string('name');
}).then(() => {
  const now = (new Date()).getTime();
  name = 'Fluffy-' + now;
  return kittens.insert({name}).into('meows')
}).then(() => {
  console.info(name + ' is a meow!')
})
