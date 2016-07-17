'use strict';

const Hopper = require('./hopper');

/**
 * Includes the most used databases, and is
 * trivial to add another driver
 *
 * @notes
 * http://db-engines.com/en/ranking
 *
 * @type {Object}
 */
const drivers = {
  elasticsearch : require('./drivers/elasticsearch'),
  mongodb       : require('./drivers/mongodb'),
  redis         : require('./drivers/redis'),
  mysql         : require('./drivers/mysql'),
  postgres      : require('./drivers/postgres'),
  sqlite        : require('./drivers/sqlite')
};

/**
 * In an app there should only ever be one instance of
 * the Hopper. That is one of the primary points of design,
 * all your connections in one place. Using this module ensures
 * that only one instance is created
 *
 * @param  {Object} config
 * @param  {Logger} logger
 * @return {Hopper}
 */
function configure(config, logger) {
  if (!Hopper.$instance) {
    Hopper.$instance = new Hopper(drivers, logger);
    Hopper.$instance.id = parseInt(Math.random() * 100000); // for debugging
  }

  if (config) {
    Hopper.$instance.configure(config);
  }

  return Hopper.$instance;
}

module.exports = configure;
