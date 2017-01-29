/**
 * @module Gateway table builder
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Module provides functionality to build gateway table
 * @type {Promise}
 **/

"use strict";
const async = require("async"),
    debug = require("debug")("gateway"),
    _ = require('lodash'),
    logger = require('../../../lib/logger'),
    compareFunction = require('./routeCompare'),
    bootstrapDrivers = require('./driversBootstrap'),
    pipeBuilder = require('./pipeBuilder'),
    global = require('../../global'),
    HttpProxyRules = require('http-proxy-rules')
    ;

/**
 * Bootstrap drivers and configure rules for api table
 * 
 * @method buildGatewayTable
 * @param   {Object}    app     Loopback application
 * @returns {Promise}           Result
 */
module.exports = function buildGatewayTable(app) {
    const ApiConfig = app.models.ApiConfig;
    const plugins = global.plugins;
    const drivers = global.drivers;
    global.driversStore.clear();
    return bootstrapDrivers(app)
        .then(() => {
            debug(`Drivers estableshed: ${global.driversStore.size}`);
            console.log(`Drivers estableshed: ${global.driversStore.size}`);
            return ApiConfig
                .find() // find all configurations
                .then((configs) => {
                    return new Promise((resolve, reject) => {
                        const activeConfigs = configs.filter(config => {
                            let errors = pipeBuilder.test(config.plugins);
                            if (errors.length > 0 && !_.isEqual(errors, config.errors)) {
                                config.errors = errors;
                                config.active = false;
                                logger.error(`Wrong configuration found in ${config.name}, deactivating entry`, errors);
                                logger.warn(`Deactivating entry ${config.name}`);
                                config.save();
                                logger.log(`Restarting...`);
                            } else {
                                if (errors.length == 0 && config.errors.length > 0) {
                                    config.errors = [];
                                    config.active = false;
                                    logger.warn(`Configuration issue fixed in ${config.name}`);
                                    config.save();
                                    logger.log(`Restaring...`);
                                }
                            }
                            return config.active;
                        });
                        resolve(activeConfigs);
                    });
                })
                .then((configs) => {
                    const rules = configs
                        .sort(compareFunction)
                        .reduce((rules, apiConfig, index) => {
                            const rule = {};
                            debug(`Handle path: ${apiConfig.entry} \t\u2192\t ${apiConfig.methods}, apply [${apiConfig.plugins.map((plugin => plugin.name))}]`);
                            const pipe = pipeBuilder.build(apiConfig.plugins);
                            rule[apiConfig.entry.toLowerCase()] = {
                                pipe: pipe,
                                methods: apiConfig.methods,
                                enabled: true,
                                path: apiConfig.entry.toLowerCase()
                            };
                            return Object.assign(rules, rule);
                        }, {});
                    global.rules = new HttpProxyRules({ rules: rules });
                });
        });
};
