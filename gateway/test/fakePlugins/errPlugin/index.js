/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function () {
        this.constructor.super.call(this, arguments);
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return next(this.getParam('throwError') ? new ErrorX(this.getParam('errorCode') || 404) : null);
        }
    };

    cls._name = 'errPlugin';
    cls._description = 'test plugin';
    return cls;
})();