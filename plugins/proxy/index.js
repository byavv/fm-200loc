/*jslint node: true */
"use strict";
const debug = require('debug')('plugins:proxy'),
    httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {

    let cls = function (app, settings) {
        let _settings = settings;
        this.app = app;

        this.getSettings = function (key) {
            return _settings[key];
        }
    };

    cls.prototype.init = function () {
        this.proxy = httpProxy.createProxyServer({});       
    };
    cls.prototype.handler = function (req, res, next) {
        if (this.getSettings('target')) {
            this.proxy.web(req, res, {
                target: this.getSettings('target') + (this.getSettings('withPath') || '/')
            }, (err) => {
                return next(err);
            });
            debug(`Proxy ${req.method}: ${req.originalUrl} \u2192 ${this.getSettings('target')}${this.getSettings('withPath')}`);
        } else {
            logger.error(new Error('Configuration error. Traget for request not set'))
            return next(new errors.err502());
        }
    }

    cls._name = 'proxy';
    cls._description = 'Simple proxying requests';
    return cls;
})()
