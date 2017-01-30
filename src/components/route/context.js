"use strict";
/**
 * Represents a pipe context object to be injected into plugins.  
 */
module.exports = (function () {
    /** @constructs Context */
    var cls = function (id, pipe, dependencies) {
        Object.assign(this, { id, pipe, dependencies });

        /**
         * Get/set parameters to/from entry pipe       
         * @param {string} key  pipe value key
         * @example
         * 
         * let param = ctx.$param['myParam'];      // get param from pipe
         * ctx.$param['myParam']='myValue'         // save new value in pipe parameter      
         * 
         * @returns {Object}    Stored in pipe value
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
         * @param {string} id  driverId
         * @example
         * 
         * let myDriverInst = ctx.$inject['myDriver']; // get injected driver instance         *          
         * 
         * @readonly
         * @returns {Object}    Driver instance
         */
        this.$inject = new Proxy({}, {
            get: (target, key) => {
                return dependencies[key];
            }
        });
    };
    return cls;
})();
