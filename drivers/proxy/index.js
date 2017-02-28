'use strict';
/*jslint node: true */
let httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    debug = require('debug')('services:proxy'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (app, serviceConfig) {
        this.proxy = httpProxy.createProxyServer({
            secure: serviceConfig.secure,
            changeOrigin: serviceConfig.changeOrigin
        });
        this.proxyRequest = function (req, res, target, clb) {
            debug(`Performing proxy request to ${target}`)
            if (!(target.startsWith('http://') || target.startsWith('https://'))) {
                return clb(new errors.err422('Target format is wrong, no protocol defined', 'Proxy service'));
            }
            this.proxy.web(req, res, {
                target: target
            }, (err) => {
                return clb(err);
            });
        }
        this.run = function () {

        }
        // ping your service or whatever, use this method for checking external servivce or api availability
        this.check = function () {
            return new Promise((resolve, reject) => {
                resolve({
                    error: false,
                    message: "Proxy server is up and running",
                    name: 'Http-proxy'
                })
            });
        }

        this.summary = function () {
            return new Promise((resolve, reject) => {
                resolve({
                    error: false,
                    message: "Proxy server is up and running",
                    name: 'Http-proxy'
                })
            });
        }
    };
    return cls;
})();
