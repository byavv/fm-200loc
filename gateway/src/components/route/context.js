/**
* @module Route Component
* @author Aksenchyk Viacheslav <https://github.com/byavv>
* @description
* Class every plugin inherites from when instantiates, provides 
* methods to work with pre-defined parameters within the plugin instance
**/

"use strict";
module.exports = (function () {
    var cls = function (id, pipe, dependencies) {        
        Object.assign(this, { id, pipe, dependencies });
        this.$param = new Proxy({}, {
            get: (target, key) => {
                return pipe._get(key, id);
            },
            set: (target, key, value) => {
                pipe._set(key, value);
                return true;
            }
        });
        this.$inject = new Proxy({}, {
            get: (target, key) => {
                return dependencies[key];
            }
        });
    };
    return cls;
})();
