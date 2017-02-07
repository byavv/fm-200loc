'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('drivers:etcd'),
    logger = require('../../lib/logger'),
    request = require('request')
    ;

module.exports = (function () {
    let cls = function (app, serviceConfig) {
        debug(`Try to instansiate connection to etcd with connection string: ${serviceConfig['connection_string']}`)
        let services = registry(`${serviceConfig['connection_string']}`)
        this.findServiceByKey = (key, clb) => {
            services.lookup(key, function (err, service) {
                clb(err, service)
            });
        }
        this.check111 = function () {
            return new Promise((resolve, reject) => {
                console.log(`${serviceConfig['connection_string']}/version`)
                request(`http://${serviceConfig['connection_string']}/version`, function (error, response, body) {
                    resolve({
                        message: !error && response.statusCode == 200 ? `Etcd server version: ${body}` : `Can't instantiate connection with remote service on ${serviceConfig['connection_string']}`,
                        error: error
                    });
                })
            });
        }

        this.summary = function () {
            return new Promise((resolve, reject) => {
                request(`http://${serviceConfig['connection_string']}/version`, function (error, response, body) {
                    resolve({
                        message: !error && response.statusCode == 200 ? `Etcd server version: ${body}` : `Can't instantiate connection with remote service on ${serviceConfig['connection_string']}`,
                        error: error,
                        data: { 'some': 'data' }
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
