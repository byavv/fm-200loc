/*jslint node: true */
"use strict";
var ErrorX = require("../../errorX");

module.exports = (function () {

    let cls = function (ctx) {       

        this.init = function () {
        };
        this.handler = function (req, res, next) {
            return res.status(200).send({ respond: 'ok' });
        }
    };
   
    return cls;
})();
