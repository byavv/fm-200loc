'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('plugins:discovery'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (app, driverConfig) {
        this.app = app;
        this.config = driverConfig;
    };

    cls.prototype.export = function () {
        return {
            services: registry(`http://${this.config['etcd_host']}:${this.config['etcd_port']}`)
        }
    }

    cls._name = 'etcd';
    cls._description = 'Etcd server driver, provides methods to work with etcd key-storage';
    return cls;
})();
