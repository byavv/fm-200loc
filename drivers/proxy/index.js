'use strict';
/*jslint node: true */
let httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    debug = require('debug')('gateway'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (app, driverConfig) {
        debug("Creating PROXY service instance")
        const proxy = httpProxy.createProxyServer({
            secure: driverConfig.secure,
            changeOrigin: driverConfig.changeOrigin
        });
        this.proxyRequest = function (req, res, target, clb) {
            debug(`Performing proxy request to ${target}`)
            if (!target.startsWith('http://') || !target.startsWith('https://')) {
                return clb(new errors.err422('Target format is wrong, no protocol defined'));
            }
            proxy.web(req, res, {
                target: target
            }, (err) => {
                console.error(err);
                return clb(err);
            });
        }
        // ping your service or whatever, use this method for checking external servivce or api availability
        this.serviceCheck = function () {
            return {
                status: "OK",
                message: "All works fine",
                error: ""
            };
        }
    };

    cls._name = 'proxy';
    cls._description = 'Simple http proxy';
    return cls;
})();
