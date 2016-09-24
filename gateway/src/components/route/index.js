/**
 * @module Route Component
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Component provides drivers bootstrap, creating middleware and configuring entryes
 **/

"use strict";
const async = require("async"),
    debug = require("debug")("gateway"),
    _ = require('lodash'),
    logger = require('../../../../lib/logger'),
    compareFunction = require('./routeCompare'),
    registry = require('etcd-registry'),
    bootstrapDrivers = require('./driversBootstrap'),
    buildPipe = require('./pipeBuilder'),
    global = require('../../global')
    ;

let superMiddlewareFactory = (options = {}) => {
    return function middleware(req, res, next) {
        debug(`Got route: ${req.originalUrl}, matched entry: ${options.routeName}`);
        const handlers = (options.plugins || [])
            .map(plugin => {
                return plugin.handler.bind(plugin, req, res);
            });
        async.series(handlers, (err) => {
            if (err) {
                logger.warn(`Error processing ${req.originalUrl}, ${err}`);
                return next(err);
            }
            next();
        });
    };
};

module.exports = function (app, componentOptions = {}) {
    const ApiConfig = app.models.ApiConfig;
    const plugins = global.plugins;
    const drivers = global.drivers;

    bootstrapDrivers(app)
        .then(() => {
            debug(`Drivers estableshed: ${global.driversStore.size}`);
            console.log(`Drivers estableshed: ${global.driversStore.size}`);
            ApiConfig.find((err, apiConfigs) => {
                if (err) throw err;
                apiConfigs
                    .sort(compareFunction)
                    .forEach(apiConfig => {
                        try {
                            let pluginsArray = buildPipe(apiConfig.plugins);
                            const initP = pluginsArray.map(plugin => {
                                if (_.isFunction(plugin.init)) {
                                    return plugin.init();
                                }
                            });
                            Promise.all(initP).then(() => {
                                app.middlewareFromConfig(superMiddlewareFactory, {
                                    enabled: true,
                                    phase: 'routes',
                                    methods: apiConfig.methods,
                                    paths: [apiConfig.entry.toLowerCase()],
                                    params: {
                                        plugins: pluginsArray,
                                        routeName: apiConfig.name
                                    }
                                });
                                debug(`Handle path: ${apiConfig.entry} \t\u2192\t ${apiConfig.methods}, apply [${apiConfig.plugins.map((plugin => plugin.name))}]`);
                            }).catch(err => {
                                throw err;
                            });
                        } catch (error) {
                            logger.error(error);
                            throw error;
                        }
                    });
            })
        }, (err) => {
            throw err;
        })
};
