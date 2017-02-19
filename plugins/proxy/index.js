/*jslint node: true */
"use strict";
const debug = require('debug')('plugins:proxy'),
    httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (ctx) {
        const proxy = httpProxy.createProxyServer({ secure: ctx('$get:secure') || false });
        this.handler = function (req, res, next) {
            if (ctx('$get:target')) {
                proxy.web(req, res, {
                    target: ctx('$get:target') + (ctx('$get:withPath') || '/'),
                    changeOrigin: ctx('$get:changeOrigin') || false
                }, (err) => {
                    return next(err);
                });
                debug(`Proxy ${req.method}: ${req.originalUrl} \u2192 ${ctx('$get:target')}${ctx('$get:withPath')}`);
            } else {
                logger.error(new Error('Configuration error. Target for request not set'))
                return next(new errors.err502());
            }
        }
    };
    cls._name = 'proxy';
    cls._description = 'Simple proxying requests';
    return cls;
})()
