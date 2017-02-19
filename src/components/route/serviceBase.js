'use strict';
/**
 * @class ServiceBase
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Base class for Loc services
 **/
function ServiceBase() {
    if (this.constructor === ServiceBase) {
        throw new Error("Can't instantiate");
    }
}
/**
 * Check service health 
 * @memberof ServiceBase.prototype
 * @function check
 * @returns {Promise}
 */
ServiceBase.prototype.check = function () {
    return Promise.resolve({
        status: "N/A",
        message: "Service doesn't provide status checking",
        error: false,
    })
}
/**
 * Gain service summary data
 * @memberof ServiceBase.prototype
 * @function summary
 * @returns {Promise}
 */
ServiceBase.prototype.summary = function () {
    return Promise.resolve({
        status: "N/A",
        message: "Service doesn't provide any data",
        error: false,
    })
}

module.exports = ServiceBase;