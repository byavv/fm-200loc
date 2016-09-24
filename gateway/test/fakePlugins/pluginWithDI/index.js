/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function () {
        this.constructor.super.call(this, arguments);

        this.handler = function (req, res, next) {
            this.dependencies[0].testMethod('testString', (err, result) => {
                console.log("-----------", result)
                return res.status(200).send({ respond: result});
            });
        }
    };

    cls._name = 'pluginWithDI';
    cls._description = 'test plugin';
    return cls;
})()