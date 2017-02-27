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
    comparatorFn = require('./routeCompare'),
    bootstrapServices = require('./servicesBootstrap'),
    pipeBuilder = require('./pipeBuilder'),
    state = require('../../state'),
    HttpProxyRules = require('http-proxy-rules'),
    loaderUtils = require('./loader.utils')(),
    R = require('ramda')
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

    let deactivateBrokenEntry = (errors, inst) => {
        logger.warn(`Configuration for entry ${inst.name} is not valid, entry is being deactivated`);
        inst.active = false;
        inst.errors = errors;
        return inst.save()
    }

    let fixEntry = (inst) => {
        logger.info(`Configuration for entry ${inst.name} become valid, can be activated manually`);
        inst.active = false;
        inst.errors = [];
        return inst.save();
    }

    let buildRule = (rule, entry) => {
        debug(`Handle path: ${entry.entry} \t\u2192\t ${entry.methods}, apply [${entry.plugins.map((plugin => plugin.name))}]`);
        const pipe = pipeBuilder.build(entry.plugins);
        rule[entry.entry.toLowerCase()] = {
            pipe: pipe,
            methods: entry.methods,
            enabled: true,
            path: entry.entry.toLowerCase()
        };
        return rule;
    }

    return bootstrapServices(app)
        .then(() => {
            console.log('\n', '************************************************', '\n');
            // 1. Get all broken entries and block them
            // 2. Get all entries that was fixed in dashboard and change their status to unblocked by removing all errors
            // 3. Get all clean entries and  start handling
            debug(`Total services running: ${state.servicesStore.size}`);
            console.log('\n', '************** Build proxy table ***************', '\n');

            return loaderUtils.getBrokenEntries(ApiConfig)
                .then((brokenEntries) => {
                    const p_Arr = [];
                    brokenEntries.forEach(brokenEntry => {
                        p_Arr.push(
                            R.pipeP(ApiConfig.findById.bind(ApiConfig),
                                R.curry(deactivateBrokenEntry)(brokenEntry.errors))(brokenEntry.id));
                    });
                    return Promise.all(p_Arr);
                })
                .then(() => loaderUtils.getEntriesToBeFixed(ApiConfig))
                .then((entriesToBeFixed) => {
                    const p_Arr = [];
                    (entriesToBeFixed || []).forEach(entryToBeFixed => {
                        p_Arr.push(R.pipeP(ApiConfig.findById.bind(ApiConfig), fixEntry)(entryToBeFixed.id));
                    });
                    return Promise.all(p_Arr);
                })
                .then(() => loaderUtils.getEntriesToHandle(ApiConfig))
                .then((entries) => R.sort(comparatorFn, entries))
                .then((entries) => R.reduce(buildRule, {/* Defaults could be set here */ }, entries))
                .then(rules => {
                    state.rules = new HttpProxyRules({ rules: rules });
                    console.log('\n', '************************************************', '\n');
                });
        });
};
