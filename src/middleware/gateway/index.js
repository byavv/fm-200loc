"use strict"
const global = require('../../global')
    , debug = require("debug")("gateway")
    , async = require('async')
    , errors = require('../../../lib/errors')
    , logger = require('../../../lib/logger');

module.exports = function middlewareFactory() {
    return function handler(req, res, next) {
        if (global.ready) {
            const target = global.rules.match(req);
            if (target) {
                debug(`Processing: ${req.originalUrl}, matched entry: ${target.path}`);
                const handlers = (target.pipe || [])
                    .map(plugin => {
                        return plugin.handler.bind(plugin, req, res);
                    });
                async.series(handlers, (err) => {
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', err)
                    if (err) {
                        logger.warn(`Error processing ${req.originalUrl}, ${err}`);
                        // return isXhr
                        //     ? res.status(err.status || 500).send({
                        //         error: err
                        //     })
                        //     : res.render("serverError", {
                        //         error: err
                        //     });
                        console.log(req.xhr)
                        return req.xhr
                            ? res.status(500).send({
                                error: err
                            })
                            : res.status(err.status || 500).send(res.render("serverError", {
                                error: err
                            }));
                    }
                    return next();
                });
            } else {
                return next();
            }
        } else {
            debug(`Gateway node is not ready to process request`);
            res.set('Retry-After', 5);
            res.status(503).end();
        }
    };
};
