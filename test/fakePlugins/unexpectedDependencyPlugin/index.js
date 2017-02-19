/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {
        this.handler = function (req, res, next) {
            ctx('$inject:testService').testMethod('testString', (err, result) => {
                console.log("+++++++++++++", result)
                return res.status(200).send({ respond: result });
            });
        }
    };

    return cls;
})()