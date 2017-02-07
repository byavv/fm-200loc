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
                    const Service = global.services.find((d) => d._name === serviceConfig.serviceId);
                    if (!Service) throw new Error(`Service ${serviceConfig.serviceId} is not defined`)
                    if (!global.servicesStore.has(serviceConfig.id)) {
                        debug(`Instansiate service: ${serviceConfig.serviceId}`);
                        Service.prototype = Object.create(ServiceBase.prototype);
                        Service.prototype.constructor = Service;
                        let serviceInstance = new Service(app, serviceSettings);
                        console.log(serviceInstance.hasOwnProperty('check'))
                        global.servicesStore.set(serviceConfig.id.toString(), {
                            name: Service._name,
                            version: Service._version,
                            instance: serviceInstance
                        });
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }).then(() => {
        console.log('\n', '**********  Services Health Check  *****', '\n');
        return Promise.all(Array.from(global.servicesStore.values())
            .map((v) => {
                return v.instance.hasOwnProperty('check') ? v.instance.check() : Promise.resolve({
                    error: true,
                    name: v.name,
                    message: `Status check method for ${v.name} service is not implemented`
                })
            }))
            .then((result) => {
                result.forEach(r => {
                    const diagnosticMessage = `Diagnostic [${r.name}]: ${r.message}`;
                    if (r.error) {
                        logger.error(diagnosticMessage);
                    } else {
                        logger.info(diagnosticMessage);
                    }
                });
            });
    });
}
