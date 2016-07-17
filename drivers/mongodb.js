'ues strict';

const mongodb  = require('mongodb');
const Promised = require('bluebird');

const Connection = mongodb.Connection;
const Server     = mongodb.Server;

module.exports = {
  /**
   * @type {String}
   */
  label: 'mongodb',

  /**
   * @type {Function}
   */
  driver: mongodb,

  /**
   * @param  {Object} config
   * @return {Object}
   */
  configure(config) {
    config.host = config.host || '127.0.0.1';
    config.port = config.port || Connection.DEFAULT_PORT;

    if (config.auto_reconnect === undefined) {
      config.auto_reconnect = true;
    }

    return config;
  },

  /**
   * @param  {Object} config
   * @return {Object}
   */
  start(config) {
    const server = new Server(config.host, config.port, config);
    const db = new mongodb.Db(config.db, server, {safe: true});
    
    return new Promised(function(resolve, reject) {
      db.open(function(err, db) {
        if (err) {
          return reject(err);
        }
        
        resolve(db);
      });
    });
  },

  /**
   * @param  {Object} conn
   * @param  {Object} store
   */
  integrate(conn, store) {
    conn.on('error',       err => store.addError(err));
    conn.on('parseError',  err => store.addError(err));
    conn.on('timeout',    data => store.addEvent(data));
  }
};