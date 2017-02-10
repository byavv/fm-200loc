'use strict';


function ServiceBase() {
    if (this.constructor === ServiceBase) {
        throw new Error("Can't instantiate");
    }
}
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

module.exports = ServiceBase;