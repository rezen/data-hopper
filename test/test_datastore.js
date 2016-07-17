'use strict';

const assert     = require('assert');
const Datastore = require('../datastore');

describe('Datastore', () => {
  let driver;

  before(() => {
    driver = {
      configure: (c) => { return c;},
      start: () => {return 'meow';}
    }
  })

  describe('#constructor', () => {
    it('', () => {
      const ds = new Datastore(driver);
      assert.equal(ds.info.status, 'cold');
      assert.equal(ds.info.errorCount, 0);
    });
  });

  describe('#setup', () => {
    it('Accepts connection name and driver', () => {
      const ds = new Datastore(driver);
      const config = {a: 'b'};
      ds.setup('test', config);
      assert.deepEqual(ds.config, config);
      assert.equal(ds.info.status, 'configured')
      assert.equal(ds.name, 'test')
    });

    it('Expect the name to be as string', () => {
      const ds = new Datastore(driver);
      assert.throws(() => ds.setup(false, {a: 'b'}));
    });

    it('Expect the config to be an object', () => {
      const ds = new Datastore(driver);
      assert.throws(() => ds.setup('test'));
    });
  });

  describe('#open', () => {
    it('Calls the driver start and updates the status', () => {
      const ds = new Datastore(driver);
      ds.setup('test', {});
      const conn = ds.open();
      assert.equal(ds.info.status, 'opened')
      assert.equal(conn, 'meow')
    });
  });

  describe('#end', () => {
    it('Calls the driver end and removes the connection', () => {
      const ds = new Datastore(driver);
      ds.setup('test', {});
      ds.open();
      ds.end();
      assert.equal(ds.info.status, 'closed')
      assert.equal(ds.connection, null)
    });
  });

  describe('#reopen', () => {
    it('Ends then opens the connection', () => {
      const flags = [];
      const ds = new Datastore(driver);
      ds.setup('test', {});
      ds.end = () => flags.push(1);
      ds.open = () => flags.push(1);
      ds.reopen();
      assert.equal(ds.info.status, 'reopening') // normally reset by end/reopen
      assert.equal(flags.length, 2);
    });
  });


  describe('#status', () => {
    it('Allows you to set valid status', () => {
     const ds = new Datastore();
     ds.status('cats')
     assert.equal(ds.info.status, 'cold')
     ds.status('errored')
     assert.equal(ds.info.status, 'errored')
    });
  });

  describe('#addError', () => {
    it('Adds errors to queue and increments error count', () => {
      const err = new Error(':(');
      const ds = new Datastore();
      ds.addError(err);
      assert.equal(ds.info.errorCount, 1)
      assert.equal(ds.errors.stack.indexOf(err), 0)
    });
  });

  describe('#addEvent', () => {
    it('Can accept queue size', () => {
      const ds = new Datastore();
      ds.addEvent('Cats out of the bag!');
      ds.addEvent({info: 'Debug message'});
      assert.equal(ds.events.stack.length, 2)
    });
  });
});