/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (app, settings) {
        let _settings = settings;
        this.app = app;
        this.getSettings = function () {
            return _settings;
        }
    };

    cls.prototype.init = function () {
    };
    cls.prototype.handler = function (req, res, next) {
        return this.getSettings().dynamic
            ? res.status(200).send({ respond: this.getSettings().dynamic })
            : res.status(200).send({ respond: this.getSettings().env })
    }

    cls._name = 'simplePlugin';
    cls._description = 'test plugin';
    return cls;
})()
