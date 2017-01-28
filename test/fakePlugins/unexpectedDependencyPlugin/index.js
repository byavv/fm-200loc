/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {
        this.handler = function (req, res, next) {
            ctx.$inject['testDriver'].testMethod('testString', (err, result) => {
                console.log("+++++++++++++", result)
                return res.status(200).send({ respond: result });
            });
        }
    };

    cls._name = 'unexpectedDependencyPlugin';
    cls._description = 'unexpectedDependencyPlugin';
    return cls;
})()