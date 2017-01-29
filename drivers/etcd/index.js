'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('drivers:etcd'),
    logger = require('../../lib/logger'),
    request = require('request')
    ;

module.exports = (function () {
    let cls = function (app, driverConfig) {
        debug(`Try to instansiate connection to etcd with connection string: ${driverConfig['connection_string']}`)
        // let services = registry(`${driverConfig['connection_string']}`)
        //  this.findServiceByKey = (key, clb) => {
        //      services.lookup(key, function (err, service) {
        //          clb(err, service)
        //      });
        //  }
        this.check = function () {
            return new Promise((resolve, reject) => {
                console.log(`${driverConfig['connection_string']}/version`)
                request(`http://${driverConfig['connection_string']}/version`, function (error, response, body) {
                    resolve({
                        message: !error && response.statusCode == 200 ? `Etcd server version: ${body}` : `Can't instantiate connection with remote service on ${driverConfig['connection_string']}`,
                        error: error,
                    });
                })
            });
        }
    };

    cls._name = 'etcd';
    cls._version = '0.0.1';
    cls._description = 'Etcd server driver, provides methods to work with etcd key-storage';
    return cls;
})();
