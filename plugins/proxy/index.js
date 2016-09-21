/*jslint node: true */
"use strict";
const debug = require('debug')('plugins:proxy'),
    httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {

    let cls = function (pipe) {
        this.constructor.super.call(this, arguments);

        this.init = function () {
            this.proxy = httpProxy.createProxyServer({});
        };
        
        this.handler = function (req, res, next) {
            if (this.getParam('target')) {
                this.proxy.web(req, res, {
                    target: this.getParam('target') + (this.getParam('withPath') || '/')
                }, (err) => {
                    return next(err);
                });
                debug(`Proxy ${req.method}: ${req.originalUrl} \u2192 ${this.getParam('target')}${this.getParam('withPath')}`);
            } else {
                logger.error(new Error('Configuration error. Traget for request not set'))
                return next(new errors.err502());
            }
        }
    };

    cls._name = 'proxy';
    cls._description = 'Simple proxying requests';
    return cls;
})()
