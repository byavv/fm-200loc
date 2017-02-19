/**
 * @module Service starter
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Bootstrap services
 * @type {Promise}
 **/
"use strict";
const async = require('async')
    , debug = require("debug")("gateway")
    , logger = require('../../../lib/logger')
    , global = require('../../global')
    , util = require('util')
    , ServiceBase = require('./serviceBase');



/**
 * Read all services from config and build instances of active ones
 * 
 * @method bootstrapServices
 * @param   {Object}    app     Loopback application
 * @returns {Promise}           Result
 */
module.exports = function bootstrapServices(app) {
    const ServiceConfig = app.models.ServiceConfig;
    return new Promise((resolve, reject) => {
        ServiceConfig.find({ /* todo: where: {active: true} */ }, (err, serviceConfigs) => {
            try {
                if (err) throw err;
                (serviceConfigs || []).forEach((serviceConfig) => {
                    const serviceSettings = serviceConfig.settings;
                    const serviceDefinition = global.services.find((d) => d.name === serviceConfig.serviceId);
                    if (!serviceDefinition) throw new Error(`Service ${serviceConfig.serviceId} is not defined`)
                    if (!global.servicesStore.has(serviceConfig.id)) {
                        debug(`Instansiate service: ${serviceConfig.serviceId}`);
                        const Service = serviceDefinition.ctr;
                        util.inherits(Service, ServiceBase);
                        let serviceInstance = new Service(app, serviceSettings);
                        global.servicesStore.set(serviceConfig.id.toString(), {
                            name: serviceDefinition.name,
                            version: serviceDefinition.version,
                            description: serviceDefinition.description,
                            instance: serviceInstance
                        });
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }).then(() => {
        console.log('\n', `**********  Services Health Check  **********`, '\n');
        return Promise.all(Array.from(global.servicesStore.values())
            .map((v) => {
                if (v.instance.hasOwnProperty('check')) {
                    return v.instance.check()
                        .then((result) => {
                            return {
                                name: v.name,
                                error: result.error,
                                message: (typeof result.message == 'string') ? result.message : JSON.stringify(result.message)
                            }
                        })
                } else {
                    return Promise.resolve({
                        error: true,
                        name: v.name,
                        message: `Status check method for ${v.name} service is not implemented`
                    });
                }
            }))
            .then((result) => {
                result.forEach(r => {
                    const diagnosticMessage = `Diagnostic [${r.name}][${r.error ? 'ERROR' : 'OK'}]: ${r.message}`;
                    if (r.error) {
                        logger.error(diagnosticMessage);
                    } else {
                        logger.info(diagnosticMessage);
                    }
                });
            });
    });
}
