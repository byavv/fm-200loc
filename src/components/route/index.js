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
    return bootstrapDrivers(app)
        .then(() => {
            debug(`Drivers estableshed: ${global.driversStore.size}`);
            console.log(`Drivers estableshed: ${global.driversStore.size}`);
            return ApiConfig
                .find() // find all configurations
                .then((configs) => {
                    const rules = configs
                        .sort(compareFunction) // sort them by entry path
                        .reduce((rules, apiConfig, index) => { 
                            debug(`Handle path: ${apiConfig.entry} \t\u2192\t ${apiConfig.methods}, apply [${apiConfig.plugins.map((plugin => plugin.name))}]`);
                            const pipe = pipeBuilder.build(apiConfig.plugins), rule = {};
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
