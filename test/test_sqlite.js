'use strict';

const fs         = require('fs');
const assert     = require('assert');
const DataHopper = require('../index');

const hopper = DataHopper();

describe('Integration - sqlite', () => {

  it('Successfully loads a connection', () => {
    hopper.load('kittens', {
      driver: 'sqlite',
      filename: __dirname + './meow.sqlite'
    });
  })

  it('Successfully gets the connection', () => {
    const kittens = hopper.get('kittens').open();
    assert(kittens);
  })

  it('Successfully uses connection methods', () => {
    const kittens = hopper.get('kittens').open();
    assert.doesNotThrow(() => {
      kittens.schema.createTableIfNotExists('meows', (table) => {
        table.increments('id');
        table.string('name');
      })
    })
  })

  it('Let us make sure the sqlite db is in the fs', (done) => {
    fs.exists(__dirname + './meow.sqlite', done);
  })

  it('Hack the require', () => {
    const kittens1 = hopper.get('kittens').open();
    hopper.hack();
    assert.doesNotThrow(() => require('data-hopper/conn/kittens'))
    const kittens2 = require('data-hopper/conn/kittens');
    assert(kittens2)
    assert.equal(kittens1, kittens2);
  })
});
