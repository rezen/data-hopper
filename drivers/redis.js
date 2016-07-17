'use strict';

const redis = require('redis');

module.exports = {
  /**
   * @type {String}
   */
  label: 'redis',
  
  /**
   * @type {Function}
   */
  driver: redis,

  /**
   * @param  {Object} config
   * @return {Object}
   */
  configure(config) {
    config        = config || {};
    config.prefix = config.prefix || 'app';
    return config;
  },

  /**
   * @param  {Object} config
   * @return {Object}
   */
  start(config) {
    return redis.createClient(config);
  },

  /**
   * @param  {Object} conn
   * @param  {Object} store
   */
  integrate(conn, store) {
    conn.on('error', err => store.addError(err));
  }
};