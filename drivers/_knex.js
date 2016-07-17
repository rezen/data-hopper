'use strict';

const knex = require('knex');

const REGEX_TABLE_ACTION = /(create|alter|drop)\stable\s(\'|")?([a-z_0-9]+)(\'|")?/g;

module.exports = function(config) {

  const db = knex(config);

  if (!config.logger) {
    return db;
  }

  db.on('query', function(data) {
    const matches = REGEX_TABLE_ACTION.exec(data.sql);

    if (!matches) {
      return;
    }

    // @todo trace source of query
    config.logger.info({
      scope  : 'table-action',
      action : matches[1], 
      table  : matches[3], 
      query  : data.sql,
      config : {
        host     : config.host, 
        database : config.database,
        driver   : config.driver
      }
    });
  });

  return db
};