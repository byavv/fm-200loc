/**
* @module Route Component
* @author Aksenchyk Viacheslav <https://github.com/byavv>
* @description
* Class every plugin inherites from when instantiates, provides 
* methods to work with pre-defined parameters within the plugin instance
**/

"use strict";
module.exports = (function () {
    var cls = function ([id, pipe, dependencies]) {
        this.id = id;
        this.dependencies = dependencies;
        this.getParam = function (key) {
            return pipe._get(key, this.id)
        }
        this.setParam = function (key, value) {
            return pipe._set(key, value);
        }
    };
    return cls;

    // var cls = function (args) {
    //     this.id = args[0];
    //     this.dependencies = args[2];
    //     this.getParam = function (key) {
    //         return args[1]._get(key, this.id)
    //     }
    //     this.setParam = function (key, value) {
    //         return args[1]._set(key, value);
    //     }
    // };
    // return cls;

})();
