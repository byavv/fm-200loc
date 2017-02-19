'use strict';
/*jslint node: true */
let debug = require('debug')('services:test');

module.exports = (function () {
    let cls = function (app, serviceConfig) { 
        this.testMethod = (param, clb) => {           
            clb(null, param.toString());
        }
    };    
    return cls;
})();