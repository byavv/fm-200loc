'use strict';

module.exports = (function () {
    let ServiceBase = function () { }
    ServiceBase.prototype.check = function () {
        return Promise.resolve({
            status: "N/A",
            message: "Service doesn't provide status checking",
            error: false,
        })
    }
    ServiceBase.prototype.summary = function () {
        return Promise.resolve({
            status: "N/A",
            message: "Service doesn't provide any data",
            error: false,
        })
    }
    return ServiceBase;
})()