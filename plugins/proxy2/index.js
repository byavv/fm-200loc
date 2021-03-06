/*jslint node: true */
"use strict";
const debug = require('debug')('plugins:proxy'),
    httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (ctx) {
        const proxyInst = ctx.$inject['proxy'];

        this.handler = function (req, res, next) {
            if (ctx.$param['target']) {
                proxyInst.proxyRequest(req, res, ctx.$param['target'] + (ctx.$param['withPath'] || '/'), (err) => {
                    if (err) {
                        logger.error(new Error('Proxy service error'))
                        return next(err);
                      //  return res.status(err.status || 502).send(err.message);
                    }
                })
                debug(`Proxy ${req.method}: ${req.originalUrl} \u2192 ${ctx.$param['target']}${ctx.$param['withPath']}`);
            } else {
                logger.error(new Error('Configuration error. Target for request not set'))
                return next(new errors.err502());
            }
        }
    };
    cls._name = 'proxy2';
    cls._description = 'Simple proxying requests';
    return cls;
})()
