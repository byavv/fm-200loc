'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('plugins:discovery'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function () {
        this.constructor.super.call(this, arguments);

        this.etcdInst = this.dependencies[0];

        this.handler = function (req, res, next) {
            if (this.getParam('mapTo')) {
                new Promise((resolve, reject) => {
                    debug(`Try to discover service: ${this.getParam('mapTo')}`);
                    try {
                        this.etcdInst.findServiceByKey(this.getParam('mapTo'), (err, service) => {
                            if (err) {
                                reject(new errors.err502(err));
                            } else {
                                if (!service) {
                                    reject(new errors.err404(`Service ${this.getParam('mapTo')} is not found`));
                                } else {
                                    resolve(service);
                                }
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                }).then(service => {
                    this.setParam('target', service.url);
                    debug(`Discovered: ["${this.getParam('mapTo')}"] \u2192 ${service.url}`);
                    return next();
                }).catch((err) => {
                    return next(err);
                });
            } else {
                return next(new errors.err501('Target service is not defined'));
            }
        };
    }
    cls._name = 'discovery';
    cls._description = 'Etcd discovery plugin, search service url in the etcd registry by key';
    return cls;
})();
