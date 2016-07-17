'use strict';

const knex = require('./_knex');

module.exports = {
  /**
   * @type {String}
   */
  label: 'mysql',
  
  /**
   * @type {Function}
   */
  driver: knex,

  /**
   * @param  {Object} config
   * @return {Object}
   */
  configure(config) {
    config = config || {};
    config.host = config.host || '127.0.0.1';
    return config;
  },

  /**
   * @param  {Object} config
   * @return {Object}
   */
  start(config) {
    return knex({
      client    : 'mysql',
      connection: config
    });
  },

  /**
   * @param  {Object} conn
   * @param  {Object} store
   */
  integrate(conn, store) {
    conn.on('error', err => store.addError(err));
  }
};