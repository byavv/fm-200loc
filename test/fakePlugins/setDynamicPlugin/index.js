/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            ctx('$put:dynamic', "harry potter");
            return next(null);
        }
    };
    return cls;
})()