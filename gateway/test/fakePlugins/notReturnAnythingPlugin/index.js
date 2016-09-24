/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function () {
        this.constructor.super.call(this, arguments);

        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return res.status(200).send({ respond: 'ok' });
        }
    };
    cls._name = 'notReturnAnythingPlugin';
    cls._description = 'test plugin';
    return cls;
})();
