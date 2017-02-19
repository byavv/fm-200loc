'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('plugins:discovery'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (ctx) {

        const etcdInst = ctx('$inject:etcd');

        this.handler = function (req, res, next) {
            if (ctx('$get:mapTo')) {
                new Promise((resolve, reject) => {
                    debug(`Try to discover service: ${ctx('$get:mapTo')}`);
                    try {
                        etcdInst.findServiceByKey(ctx('$get:mapTo'), (err, service) => {
                            if (err) {
                                reject(new errors.err502(err));
                            } else {
                                if (!service) {
                                    reject(new errors.err404(`Service ${ctx('$get:mapTo')} is not found`));
                                } else {
                                    resolve(service);
                                }
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                }).then(service => {
                    ctx('$put:target', service.url);
                    debug(`Discovered: ["${ctx('$get:mapTo')}"] \u2192 ${service.url}`);
                    return next();
                }).catch((err) => {
                    return next(err);
                });
            } else {
                return next(new errors.err501('Target service is not defined'));
            }
        };
    }
    return cls;
})();
