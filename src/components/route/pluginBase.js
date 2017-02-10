/**
 * @memberof gateway
 */

"use strict";

function PluginBase() {
    if (this.constructor === PluginBase) {
        throw new Error("Can't instantiate");
    }
};

PluginBase.prototype.handler = function (req, res, next) {
    next();
}

module.exports = PluginBase;