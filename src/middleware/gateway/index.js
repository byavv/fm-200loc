"use strict"
const global = require('../../global')
    , debug = require("debug")("gateway")
    , async = require('async')
    , logger = require('../../../lib/logger');

module.exports = function middlewareFactory() {
    return function handler(req, res, next) {
        const isXhr = req.headers.accept && req.headers.accept.includes('json');
        if (global.ready) {
            const target = global.rules.match(req);
            if (target) {
                debug(`Processing: ${req.originalUrl}, matched entry: ${target.path}`);
                const handlers = (target.pipe || [])
                    .map(plugin => {
                        return plugin.handler.bind(plugin, req, res);
                    });
                async.series(handlers, (err) => {
                    if (err) {
                        logger.warn(`Error processing ${req.originalUrl}, ${err}`);
                        return isXhr
                            ? res.status(err.status || 500).send({
                                error: err
                            })
                            : res.render("serverError", {
                                error: err
                            });
                    }
                    return next();
                });
            } else {
                return next();
            }
        } else {
            debug(`Gateway node is not ready to process request`);
            next();
        }
    };
};
