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
})();
