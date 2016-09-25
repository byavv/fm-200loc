/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {

        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return next(ctx.$param['throwError'] ? new ErrorX(ctx.$param['errorCode'] || 404) : null);
        }
    };

    cls._name = 'errPlugin';
    cls._description = 'test plugin';
    return cls;
})();