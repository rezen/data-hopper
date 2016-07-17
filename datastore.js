'use strict';

const EventEmitter = require('eventemitter2').EventEmitter2;
const FixedQueue   = require('./fixed-queue');

/**
 * Wraps a datastore connection & driver
 * to hold information and pass that info
 * up to the hopper!
 */
class Datastore extends EventEmitter {

  /**
   * @param  {Object} driver
   * @param  {Hopper} hopper
   */
  constructor(driver, hopper) {
    super({wildcard: true});
    this.driver     = driver;
    this.hopper     = null;
    this.connection = null;
    this.info       = {status: 'cold', errorCount:0};
    this.errors     = new FixedQueue(40);
    this.events     = new FixedQueue(40);
  }

  /**
   * @param  {String} name
   * @param  {Object} config
   */
  setup(name, config) {
    if (typeof name !== 'string') {
      throw new Error('Expects the {name} to be a string');
    }

    if (typeof config !== 'object') {
      throw new Error('Expects the {config} to be an object');
    }

    this.name   = name;
    this.config = this.driver.configure(config);
    this.status('configured');
    return this;
  }

  /**
   * @return {Mixed}
   */
  open() {
    if (this.connection) {
      return this.connection;
    }

    // @todo check if configured
    // @todo try/catch
    this.connection = this.driver.start(this.config);

    if (typeof this.driver.integrate === 'function') {
      this.driver.integrate(this.connection, this);
    }

    this.status('opened');
    return this.connection;
  }

  /**
   * End the connection, call the driver's end
   * function if it exists
   */
  end() {
    this.status('closed');
    if (typeof this.driver.end !== 'function') {
      this.connection = null;
      return;
    }

    this.driver.end(this.connection);
    this.connection = null;
  }

  /**
   * Close and open the connection
   *
   * @return {Mixed}
   */
  reopen() {
    this.status('reopening');
    this.end();
    return this.open();
  }

  /**
   * Set the status of the datastore
   *
   * @param  {String} status
   * @return {this}
   */
  status(status) {
    const isValid = (Datastore.states.indexOf(status) !== -1);

    if (!isValid) {
      return this;
    }

    this.info.status = status;
    this.emit('changed.state', this.info);
    return this;
  }

  /**
   * Can be used by the drver integration to add
   * errors for tracking
   *
   * @param {Error} err
   */
  addError(err) {
    if (!err) {return;}

    this.info.errorCount++;
    this.errors.push(err);
  }

  /**
   * A generic interface that the driver
   * integration can use to add events to
   * the datastore
   *
   * @param {Mixed} event
   */
  addEvent(event) {
    if (!event) {return;}

    this.events.push(event);
  }
}

/**
 * Valid datatore states
 *
 * @type {Array}
 */
Datastore.states = [
  'cold', 'configured', 'opened', 'closed', 'errored', 'reopening'
];

module.exports = Datastore;
