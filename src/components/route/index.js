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
    bootstrapServices = require('./servicesBootstrap'),
    pipeBuilder = require('./pipeBuilder'),
    state = require('../../state'),
    HttpProxyRules = require('http-proxy-rules')
    ;

/**
 * Bootstrap services and configure rules for api table
 * 
 * @method buildGatewayTable
 * @param   {Object}    app     Loopback application
 * @returns {Promise}           Result
 */
module.exports = function buildGatewayTable(app) {
    const ApiConfig = app.models.ApiConfig;
    const plugins = state.plugins;
    const services = state.services;
    state.servicesStore.clear();
    return bootstrapServices(app)
        .then(() => {

            debug(`Total serivces storage size: ${state.servicesStore.size}`);
            console.log('\n', '*********************************************', '\n');

            return ApiConfig
                .find()
                .then((configs) => {
                    return new Promise((resolve, reject) => {
                        const activeConfigs = configs.filter(config => {
                            let errors = pipeBuilder.test(config.plugins);
                            if (errors.length > 0 && !_.isEqual(errors, config.errors)) {
                                config.errors = errors;
                                config.active = false;
                                logger.error(`Wrong configuration found in ${config.name}`);
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
                    state.rules = new HttpProxyRules({ rules: rules });

                });
        });
};
