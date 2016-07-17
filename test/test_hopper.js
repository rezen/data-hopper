'use strict';

const assert    = require('assert');
const Hopper    = require('../hopper');
const Datastore = require('../datastore');

describe('Hopper', () => {
  let driver;
  const noop = function() {};

  before(() => {
    driver = {
      configure: (c) => { return c;},
      start: () => {return 'meow';}
    }
  })

  describe('#constructor', () => {
    it('Accepts logger', () => {
      const hop = new Hopper(null, 'meow');
      assert.equal(hop.logger, 'meow');
    });
  });

  describe('#has', () => {
    it('Validates that the named store exists', () => {
      const hop = new Hopper();
      hop.stores.set('db001', true);
      assert(hop.has('db001'))
      assert(!hop.has('db002'))
    });
  });

  describe('#info', () => {
    it('Provides information on a a connection name', () => {
      const hop = new Hopper({sqlite: driver});
      hop.load('gif-pix', {
        driver: 'sqlite'
      });

      const info = hop.info('gif-pix');

      assert(info);
      assert.equal(info.status, 'configured')
    });
  });

  describe('#useDriver', () => {
    let hop;

    beforeEach(() => {hop = new Hopper()})

    it('Adds/updates a named driver', () => {
      hop.useDriver('sqlite', driver)
    });

    it('Adds/updates a named driver with a config object', () => {
      const driverConfig = Object.assign({name: 'sqlite'}, driver);
      hop.useDriver(driverConfig);
    });

    it('Throws exception with config missing info', () => {
      assert.throws(() => hop.useDriver(driver))
    });

    it('Throws exception with driver missing', () => {
      assert.throws(() => hop.useDriver('test', null))
    });

    it('Throws exception with driver missing configure', () => {
      assert.throws(() => hop.useDriver('test', {}))
    });

    it('Throws exception with driver missing start', () => {
      assert.throws(() => hop.useDriver('test', {configure: () => {}}))
    });

    it('Does not overwrite existing drivers by default', () => {
      hop.useDriver('sqlite', driver)
      hop.useDriver('sqlite', {name: 'test', configure: noop, start: noop})
      const d = hop.drivers.get('sqlite');
      assert.equal(driver, d);
    });

    it('Overwrite existing drivers if you tell it to', () => {
      const newDriver = {name: 'test', configure: noop, start: noop};
      hop.useDriver('sqlite', driver)
      hop.useDriver('sqlite', newDriver, true)
      const d = hop.drivers.get('sqlite');
      assert.notEqual(driver, d);
      assert.equal(newDriver, d);
    });
  });

  describe('#get', () => {
    it('Get the connection of the specified name', () => {
      const hop = new Hopper({sqlite: driver});
      hop.load('cnxName', {driver: 'sqlite'});
      const conn = hop.get('cnxName');
      assert(conn)
      assert(!hop.get('trollolololo'))
    });
  });

  describe('#load', () => {
    let hop;

    beforeEach(() => {hop = new Hopper({sqlite: driver})})

    it('Adds a connection', () => {
      assert.doesNotThrow(() => hop.load('cnxName', {driver: 'sqlite'}));
    });

    it('Allows connection config to be an object', () => {
      assert.doesNotThrow(() => hop.load({name: 'cnxName', driver: 'sqlite'}));
    });

    it('Does not re-add connection names', () => {
      const a = hop.load({name: 'a', driver: 'sqlite'});
      const b = hop.load({name: 'a', driver: 'sqlite', attr: 'val'});
      assert.deepEqual(a, b);
      assert.notEqual(b.config.attr, 'val');
    });

    it('Adds hopper logger to config if there is no logger config', () => {
      hop.logger = 'logger!';
      const a = hop.load({name: 'a', driver: 'sqlite'});
      assert.equal(hop.logger, a.config.logger);
    });

    it('Does not add hopper logger if already configured', () => {
      hop.logger = 'logger!';
      const a = hop.load({name: 'a', driver: 'sqlite', logger: 'jack'});
      assert.notEqual(hop.logger, a.config.logger);
    });

    it('Throws an error if no config is provided', () => {
      assert.throws(() => hop.load('cnxName'));
    });

    it('Throws an error if the driver is not specified', () => {
      assert.throws(() => hop.load('cnxName', {}));
    });

    it('Throws an error if the driver does not exist', () => {
      hop.drivers = new Map()
      assert.throws(() => hop.load('cnxName', {driver: 'sqlite'}));
    });
  });

  describe('#wire', () => {
    let store;
    let hop;

    before(() => {
      store = (new Datastore({start: noop, configure: noop})).setup('zing', {})
      hop = new Hopper();
    })

    it('Puts store into require cache if hackRequire is enabled', () => {
      const id = hop.prefixRequire +  store.name;

      hop.wire(store)
      assert(!require.cache[id]);
      hop.hackRequire = true;
      hop.wire(store)
      assert(require.cache[id]);
    });
  });

  describe('#hack', () => {
    let store;
    let hop;

    before(() => {
      store = (new Datastore({start: () => {return 'conn';}, configure: noop})).setup('zing', {})
      hop = new Hopper();
      hop.stores.set(store.name, store)
    })

    it('Sets hackRequire flag', () => {
      hop.hack()
      assert(hop.hackRequire)
    });

    it('Calls wireStores to setup existing connections', () => {
      var flag = false;
      hop.wireStores = function() {flag = true};
      hop.hack()
      assert(flag)
    });

    it('Allows connections to be required', () => {
      hop.hack()
      const conn = require('data-hopper/conn/zing')
      assert.equal(conn, 'conn');
    });
  });

  describe('#configure', () => {
    it('Accepts multiple configs', () => {
      const hop = new Hopper(null, 'x');
      hop.configure(false);
      assert.deepEqual(hop.config, {logger: 'x'});
    });

    it('Accepts a default connection config', () => {
      const name = 'db_xyz_01';
      const hop = new Hopper(null, 'x');
      hop.configure({default: name});
      assert.equal(hop.defaultName, name);
      assert.equal(hop.config.default, name);
    });

    it('Accepts a logger config', () => {
      const hop = new Hopper();
      hop.configure({logger: 'y'});
      assert.equal(hop.config.logger, 'y');
    });

    it('Accepts a logger config', () => {
      const hop = new Hopper({sqlite: driver});
      hop.configure({connections: {
        'gif-pix': {
          driver: 'sqlite'
        }
      }});
    });
  });
});