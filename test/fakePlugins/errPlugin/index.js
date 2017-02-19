/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {
        this.init = function () { };
        this.handler = function (req, res, next) {
            return next(ctx('$get:throwError') ? new ErrorX(ctx('$get:errorCode') || 404) : null);
        }
    };
    return cls;
})();
