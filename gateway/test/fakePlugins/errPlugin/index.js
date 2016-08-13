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
         return next(this.getSettings().throwError ? new ErrorX(this.getSettings().errorCode || 404) : null);
    }

    cls._name = 'errPlugin';
    cls._description = 'test plugin';
    return cls;
})();