/**
 * @module Route Component
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Class to be injected into every plugin and represents pipe context, 
 * which provides methods to work with pre-defined parameters and dependencies *
 */
"use strict";
module.exports = (function () {
    var cls = function (id, pipe, dependencies) {        
        Object.assign(this, { id, pipe, dependencies });
        /**
         *  Get/set parameters to/from entry pipe
         *  e.g. ctx.$param['myParam'] or ctx.$param['myParam']='myValue';
         */
        this.$param = new Proxy({}, {
            get: (target, key) => {
                return pipe._get(key, id);
            },
            set: (target, key, value) => {
                pipe._set(key, value);
                return true;
            }
        });
        /**
         * Get plugins preconfigured dependencies
         * e.g.: ctx.$inject['myDriver'];
         */
        this.$inject = new Proxy({}, {
            get: (target, key) => {
                return dependencies[key];
            }
        });
    };
    return cls;
})();
