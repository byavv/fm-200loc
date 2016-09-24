'use strict';
/*jslint node: true */
let debug = require('debug')('drivers:test');

module.exports = (function () {
    let cls = function (app, driverConfig) { 
        this.testMethod = (param, clb) => {           
            clb(null, param.toString());
        }
    };

    cls._name = 'testDriver';
    cls._description = '';
    return cls;
})();