/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (app, settings) {
       this.constructor.super.call(this, arguments);
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return this.getParam("dynamic")
                ? res.status(200).send({ respond: this.getParam("dynamic") })
                : res.status(200).send({ respond: this.getParam("env") })
        }
    };

    cls._name = 'simplePlugin';
    cls._description = 'test plugin';
    return cls;
})()
