/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {     
        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return ctx.$param["dynamic"]
                ? res.status(200).send({ respond: ctx.$param["dynamic"] })
                : res.status(200).send({ respond: ctx.$param["env"] })
        }
    };

    cls._name = 'simplePlugin';
    cls._description = 'test plugin';
    return cls;
})()
