/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {      
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            ctx.$param['dynamic'] = "harry potter";
            return next(null);
        }
    };

    cls._name = 'setDynamicPlugin';
    cls._description = 'test plugin';
    return cls;
})()