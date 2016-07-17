'use strict';

const elasticsearch = require('elasticsearch');

module.exports = {
  /**
   * @type {String}
   */
  label: 'elasticsearch',

  /**
   * @type {Function}
   */
  driver: elasticsearch.Client,

  /**
   * @param  {Object} config
   * @return {Object}
   */
  configure(config) {
    config = config || {};

    if (!config.apiVersion) {
      throw new Error('You need to specify the {apiVersion} for elasticsearch');
    }

    if (!config.host && !config.hosts) {
      config.host = 'localhost:9200';
    }

    return config;
  },

  /**
   * @param  {Object} config
   * @return {Object}
   */
  start(config) {
    return new elasticsearch.Client(config);
  }
};

