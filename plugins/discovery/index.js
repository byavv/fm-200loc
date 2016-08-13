'use strict';
/*jslint node: true */
let registry = require('etcd-registry'),
    errors = require('../../lib/errors'),
    debug = require('debug')('plugins:discovery'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (app, settings, pipe) {
        let _settings = settings;
        let _pipe = pipe;
        this.getSettings = function (key) {
            return _settings[key];
        }
        this.getPipe = function () {
            return _pipe;
        }
        this.app = app;
    };

    cls.prototype.init = function () {
        this.services = registry(`http://${this.getSettings('etcd_host')}:${this.getSettings('etcd_port')}`)
    }
    cls.prototype.handler = function (req, res, next) {
        if (this.getSettings('mapTo')) {
            new Promise((resolve, reject) => {
                debug(`Try to discover service: ${this.getSettings('mapTo')} on http://${this.getSettings('etcd_host')}:${this.getSettings('etcd_port')}`);
                try {
                    this.services.lookup(this.getSettings('mapTo'), (err, service) => {
                        if (err) {
                            reject(new errors.err502(`Service ${this.getSettings('mapTo')} discovery error`))
                        } else {
                            if (!service) {
                                reject(new errors.err404(`Service ${this.getSettings('mapTo')} is not found`));
                            } else {
                                resolve(service);
                            }
                        }
                    });
                } catch (error) {
                    reject(error)
                }
            }).then(service => {
                this.getPipe().set('target', service.url);
                debug(`Service ${this.getSettings('mapTo')} found on: ${service.url}`);
                debug('Target set', this.getPipe().get())
                return next();
            }).catch((err) => {
                return next(err);
            });
        } else {
            return next(new errors.err404('Service is not found'));
        }
    };
    cls._name = 'discovery';
    cls._description = 'Etcd discovery plugin, search service url in the etcd registry by key';
    return cls;
})();
