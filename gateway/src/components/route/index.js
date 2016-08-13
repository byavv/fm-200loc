/*jslint node: true */
"use strict";
const async = require("async"),
    debug = require("debug")("gateway"),
    uuid = require('node-uuid'),
    _ = require('lodash'),
    logger = require('../../../../lib/logger'),
    Pipe = require('./pipe')
    ;
{
    let superMiddlewareFactory = (options = {}) => {
        return (req, res, next) => {
            debug(`Got route: ${req.originalUrl}, matched entry: ${options.routeName}`);
            const handlers = (options.plugins || []).map(plugin => {
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
        const DYNAMIC_CONFIG_PARAM = /\$\{(\w+)\}$/;
        const ENV_CONFIG_PARAM = /\env\{(\w+)\}$/;
        const plugins = app.plugins;
        const defaults = {/* defaults for all routes */ }

        ApiConfig.find((err, apiConfigs) => {
            if (err) throw err;
            (apiConfigs || []).forEach(apiConfig => {
                try {
                    const pipe = new Pipe(Object.assign({}, defaults, {/* defaults for this route*/ }))
                    const pluginsArray = [];
                    (apiConfig.plugins || []).forEach((plugin) => {
                        const settings = Object.assign({}, plugin.settings);

                        // find all dynamic parameters and provide getting values from global pipe object or environment
                        Object.keys(settings).forEach((paramKey) => {
                            const matchDyn = settings[paramKey] && _.isString(settings[paramKey])
                                ? settings[paramKey].match(DYNAMIC_CONFIG_PARAM)
                                : false;
                            const matchEnv = settings[paramKey] && _.isString(settings[paramKey])
                                ? settings[paramKey].match(ENV_CONFIG_PARAM)
                                : false;
                            if (matchDyn) {
                                Object.defineProperty(settings, paramKey, {
                                    get: function () {
                                        return pipe.get(matchDyn[1]);
                                    }
                                });
                            }
                            if (matchEnv) {
                                Object.defineProperty(settings, paramKey, {
                                    get: function () {
                                        return process.env[matchEnv[1]];
                                    }
                                });
                            }
                        });

                        let Plugin = app.plugins.find((p) => p._name === plugin.name);
                        if (!Plugin) {
                            pluginsArray.push(require('./defaultPlugin')(plugin.name));
                        } else {
                            let plugin = new Plugin(app, settings, pipe);
                            pluginsArray.push(plugin);
                        }
                    });

                    const initP = pluginsArray.map(plugin => {
                        if (typeof plugin.init === "function") {
                            return plugin.init();
                        }
                    });

                    Promise.all(initP).then(() => {
                        app.middlewareFromConfig(superMiddlewareFactory, {
                            enabled: true,
                            phase: 'routes',
                            methods: apiConfig.methods,
                            paths: [apiConfig.entry],
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
    };
}
