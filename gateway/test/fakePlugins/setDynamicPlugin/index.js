/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (app, settings, pipe) {
        this.constructor.super.call(this, arguments);
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            this.setParam('dynamic', "harry potter");
            return next(null);
        }
    };

    cls._name = 'setDynamicPlugin';
    cls._description = 'test plugin';
    return cls;
})()