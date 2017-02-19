/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return ctx('$get:dynamic')
                ? res.status(200).send({ respond: ctx('$get:dynamic') })
                : res.status(200).send({ respond: ctx('$get:env') })
        }
    };

    return cls;
})()
