/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (app, settings, pipe) {
        let _settings = settings;
        this.app = app;
        this.pipe = pipe;
        this.getSettings = function () {
            return _settings;
        }
    };

    cls.prototype.init = function () {
    };
    cls.prototype.handler = function (req, res, next) {
        this.pipe.set('dynamic',"harry potter");
        return next(null);
    }

    cls._name = 'setDynamicPlugin';
    cls._description = 'test plugin';
    return cls;
})()