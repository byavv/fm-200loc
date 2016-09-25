'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('plugins:discovery'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (ctx) {

        const etcdInst = ctx.$inject['etcd'];

        this.handler = function (req, res, next) {
            if (ctx.$param['mapTo']) {
                new Promise((resolve, reject) => {
                    debug(`Try to discover service: ${ctx.$param['mapTo']}`);
                    try {
                        etcdInst.findServiceByKey(ctx.$param['mapTo'], (err, service) => {
                            if (err) {
                                reject(new errors.err502(err));
                            } else {
                                if (!service) {
                                    reject(new errors.err404(`Service ${ctx.$param['mapTo']} is not found`));
                                } else {
                                    resolve(service);
                                }
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                }).then(service => {
                    ctx.$param['target'] = service.url;
                    debug(`Discovered: ["${ctx.$param['mapTo']}"] \u2192 ${service.url}`);
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
