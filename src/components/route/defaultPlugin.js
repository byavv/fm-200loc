/**
 * @memberof gateway
 */

"use strict";
const errors = require("../../../lib/errors");

module.exports = (function () {
    let cls = function (name) {
        this.handler = function (req, res, next) {
            return next(new errors.err500(`[${name}] is not implemented`));
        }
    };
    cls._name = 'defaultPlugin';    
    return cls;
})();
