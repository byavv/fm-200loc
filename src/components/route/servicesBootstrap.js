/**
 * @module Services Bootstrap 
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Bootstrap services
 * @type {Promise}
 **/
"use strict";
const async = require('async')
    , debug = require("debug")("gateway")
    , logger = require('../../../lib/logger')
    , state = require('../../state')
    , util = require('util')
    , ServiceBase = require('./serviceBase')
    , R = require('ramda')
    , loaderUtils = require('./utils/loader.utils')()
    ;


const buildServiceMetadata = (app, servicesCrs, serviceMetadataAggr, serviceConfig) => {
    const serviceSettings = serviceConfig.settings;
    const serviceDefinition = servicesCrs.find((d) => d.name === serviceConfig.serviceId);
    if (!serviceDefinition) throw new Error(`Service ${serviceConfig.serviceId} is not defined`)
    if (!serviceMetadataAggr.has(serviceConfig.id)) {
        debug(`Instansiate service: ${serviceConfig.serviceId}`);
        const Service = serviceDefinition.ctr;
        util.inherits(Service, ServiceBase);
        let serviceInstance = new Service(app, serviceSettings);
        serviceMetadataAggr.set('' + serviceConfig.id, {
            name: serviceDefinition.name,
            version: serviceDefinition.version,
            description: serviceDefinition.description,
            instance: serviceInstance
        });
        return serviceMetadataAggr;
    }
}
const getCheckMessage = (metadata, resultFromService) => ({
    name: metadata.name,
    error: resultFromService.error,
    message: (typeof resultFromService.message == 'string') ? resultFromService.message : JSON.stringify(resultFromService.message)
})

const getStatusInfoFrom = (services) => R.reduce((aggr, metadata) => {
    if (metadata.instance.hasOwnProperty('check')) {
        aggr.push(loaderUtils.pipePromise(metadata.instance.check(), [R.curry(getCheckMessage)(metadata)]));
    } else {
        aggr.push(Promise.resolve({
            error: true,
            name: metadata.name,
            message: `Status check method for ${v.name} service is not implemented`
        }))
    }
    return aggr;
}, [], services);

/**
 * Read all services from config and build instances of active ones
 * 
 * @method bootstrapServices
 * @param   {Object}    app     Loopback application
 * @returns {Promise}           Result
 */
module.exports = function bootstrapServices(app) {
    const ServiceConfig = app.models.ServiceConfig;

    return ServiceConfig
        .find()
        .then((serviceConfigs) => {
            console.log('\n', '************** Services Running ****************', '\n')
            const p_Arr = [];
            state.servicesStore = R.reduce(R.curry(buildServiceMetadata)(app, state.services), new Map(), serviceConfigs);
            for (let metadata of state.servicesStore.values()) {
                p_Arr.push(metadata.instance.run());
            }
            return Promise.all(p_Arr);
        })
        .then(() => console.log('\n', '************ Services Health Check *************', '\n'))
        // .then(() => Promise.all(getStatusInfoFrom(state.servicesStore.values())))
        // .then((result) => {
        //     result.forEach(r => {
        //         const diagnosticMessage = `Diagnostic [${r.name}][${r.error ? 'ERROR' : 'OK'}]: ${r.message}`;
        //         if (r.error) {
        //             logger.error(diagnosticMessage);
        //         } else {
        //             logger.info(diagnosticMessage);
        //         }
        //     });
        // });
}
