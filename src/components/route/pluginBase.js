/**
 * @class PluginBase
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Base class for Loc Plugins
 */

"use strict";

function PluginBase() {
    if (this.constructor === PluginBase) {
        throw new Error("Can't instantiate");
    }
};
/**
 * Plugin middleware, by default just pass request to the next 
 * plugin in the pipe, should be overridden in inherited class
 * 
 * @method handler
 * @memberof PluginBase.prototype
 * @param   {Object}      req      express req
 * @param   {Object}      res      express res
 * @param   {Function}    next     express next
 */
PluginBase.prototype.handler = function (req, res, next) {
    next();
}

module.exports = PluginBase;