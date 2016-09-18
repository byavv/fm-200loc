'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('drivers:etcd'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (app, driverConfig) {
        debug(`Try to instansiate connection to etcd with connection string: ${driverConfig['connection_string']}`)
        let services = registry(`${driverConfig['connection_string']}`)
        this.findServiceByKey = (key, clb) => {
            services.lookup(key, function (err, service) {                
                clb(err, service)
            });
        }
    };

    cls._name = 'etcd';
    cls._description = 'Etcd server driver, provides methods to work with etcd key-storage';
    return cls;
})();
