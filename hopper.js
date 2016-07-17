'use strict';

const Datastore = require('./datastore');

/**
 * Keep all your datastore connections in one
 * place, making it easy to grab your already
 * configured datastore connection and use it
 */
class Hopper {

  /**
   * @param  {Object} drivers
   * @param  {Object} config
   * @param  {Logger} logger // @todo validate argument
   */
  constructor(drivers, logger) {
    drivers          = drivers || {};

    this.drivers       = new Map();
    this.stores        = new Map();
    this.Datastore     = this.Datastore || Datastore;
    this.config        = {};
    this.logger        = logger;
    this.defaultName   = null;
    this.hackRequire   = false;
    this.prefixRequire = 'data-hopper/conn/';

    Hopper.instanceCount++;

    for (const driver in drivers) {
      this.useDriver(driver, drivers[driver]);
    }
  }

  /**
   * Does the connection of the given name exist?
   *
   * @param  {String}  name
   * @return {Boolean}
   */
  has(name) {
    return this.stores.has(name);
  }

  /**
   * @param  {Object} config
   * @return {Hopper}
   */
  configure(config) {
    config = config || {};

    this.config = config;

    if (typeof config.default === 'string') {
      this.defaultName = config.default;
    }

    if (!this.logger && config.logger) {
      this.logger = config.logger;
    }

    if (!config.logger && this.logger) {
      config.logger = this.logger;
    }

    if (!config.connections && typeof config.connections !== 'object') {
      return this;
    }

    for (const name in config.connections) {
      let conf = Object.assign({}, {logger: config.logger}, config.connections[name]);
      this.load(name, conf);
    }

    return this;
  }

  /**
   * Get information for a named connection
   *
   * @param  {String} name
   * @return {Object}
   */
  info(name) {
    if (!this.has(name)) {
      return undefined;
    }

    const store = this.stores.get(name);
    const info  = Object.assign({}, store.info);
    info.config = Object.assign({}, store.config);
    return info;
  }

  /**
   * Add a driver to the list or update existing driver
   *
   * @param {String|Object} name
   * @param {Object} driver
   * @param {Boolean}
   */
  useDriver(name, driver, update) {
    if (typeof name === 'object') {
      update = driver;
      driver = name;
      name = driver.name || driver.label;
    }

    if (!name) {
      throw new Error('You cannot add a driver without a name');
    }

    if (!driver) {
      throw new Error('You cannot add a driver that is nothing');
    }

    if (this.drivers.has(name) && !update) {
      return this;
    }

    if (typeof driver.configure !== 'function') {
      throw new Error('This {driver} is missing a configure function - ' + name);
    }

    if (typeof driver.start !== 'function') {
      throw new Error('This {driver} is missing a start function - ' + name);
    }

    this.drivers.set(name, driver);
    return this;
  }

  /**
   * Get the datastore of the specified name or undefined
   *
   * @param  {String} name
   * @return {Mixed}
   */
  get(name) {
    name = name || this.defaultName;

    if (!this.has(name)) {
      return undefined;
    }

    return this.stores.get(name);
  }

  /**
   * Load a connection into the hopper!
   *
   * @param  {String} name
   * @param  {Object} config
   * @return {Datastore}
   */
  load(name, config) {
    if (typeof name === 'object') {
      config = name;
      name   = config.name;
    }

    if (typeof name !== 'string') {
      throw new Error('{name} Cannot create a connection w/o a name');
    }

    if (this.has(name)) {
      return this.get(name);
    }

    this.validateConfig(config);

    if (config.logger === undefined) {
      config.logger = this.logger;
    }

    const store = this.setupStore(
      name, config, this.drivers.get(config.driver)
    );

    return store;
  }

  /**
   * @private
   * @param  {String} name
   * @param  {Object} config
   * @param  {Object} driver
   * @return {Datastore}
   */
  setupStore(name, config, driver) {
    const store = new this.Datastore(driver, this);

    store.setup(name, config);

    if (this.hackRequire) {
      this.wire(store);
    }

    this.stores.set(name, store);

    return store;
  }

  /**
   * Validate a connection config
   *
   * @param  {Object} config
   */
  validateConfig(config) {
    if (!config) {
      throw new Error('{config} Cannot setup without a config');
    }

    if (!config.driver) {
      throw new Error('{config} Cannot create a connection w/o a driver');
    }

    if (!this.drivers.has(config.driver)) {
      throw new Error('This driver does not exist - ' + config.driver);
    }
  }

  /**
   * Aggregating stores results into one place makes logging
   * a nicer experience!
   *
   * @param  {Datastore} store
   */
  monitor(store) {}

  /**
   * Wires a store so that you can directly get the connection
   * by requiring it!
   *
   * @private
   * @param  {Datastore} store
   */
  wire(store) {
    if (!this.hackRequire) {return;}

    const idStore = ''.concat('data-hopper/store/', store.name);
    const id      = ''.concat(this.prefixRequire, store.name);

    require.cache[id] = {
      id,
      filename: id,
      loaded:   true,
      exports:  store.open()
    };
  }

  /**
   * @private
   */
  wireStores() {
    if (!this.hackRequire) {return;}

    for (const [name, store] of this.stores) {
      this.wire(store);
    }
  }

  /**
   * Override the module resolver to resolve
   * connection names to their connection so you
   * can require them like so:
   *
   * const cats = require('data-hopper/conn/cats');
   *
   * This feature may be problematic if there are multiple
   * Hopper instances.
   */
  hack() {
    this.hackRequire = true;

    const self   = this;
    const Module = require('module');

    // Ensure existing stores are wired
    this.wireStores();

    if (this.rewiredResolve) {
      return;
    }

    const _resolveFilename = Module._resolveFilename;

    // @todo there needs to be a way to revert resolver
    Module._resolveFilename = function hopperWrapped(request, parent) {
      if (request.indexOf(self.prefixRequire) === 0) {
        const name = request.split('/').pop();

        if (self.has(name)) {
          return request;
        }
      }

      return _resolveFilename(request, parent);
    };

    Module._resolveFilename.original = _resolveFilename;

    this.rewiredResolve = true;
  }
}

/**
 * The Hopper class was designed to only
 * have one instance in existence. Added this counter
 * to make debugging easier.
 *
 * @type {Number}
 */
Hopper.instanceCount = 0;

/**
 * @type {Hopper|Null}
 */
Hopper.$instance = null;

module.exports = Hopper;
