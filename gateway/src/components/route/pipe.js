/**
 * @module Route Component
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Class provides store object for entry and used implicitly
 * to provide access to pre-configured or dynamic entry params
 **/

"use strict";
const _ = require('lodash');

module.exports = (function () {
    const DYNAMIC_CONFIG_PARAM = /\$\{(\w+)\}$/;
    const ENV_CONFIG_PARAM = /\env\{(\w+)\}$/;

    const cls = function (plugins) {
        this.settings = [];
        this.value = new Map();
    }

    cls.prototype.insert = function (settings, index) {
        this.settings[index] = settings;
    }

    /**
     * Get stored value by key
     * @param string  key  - key
     * @param string  id   - plugin identificator
     */
    cls.prototype._get = function (key, id) {
        if (!this.settings[id]) throw new Error(`No config found ${id}: ${key}`);

        /* 
        find all dynamic parameters and provide getting values
        from global pipe object stored by another plugin above
        in the pipe
           eg.:    ${param}
        or from process environment 
           eg.:    env{param}
        */

        const matchDynamic = this.settings[id][key] && _.isString(this.settings[id][key])
            ? this.settings[id][key].match(DYNAMIC_CONFIG_PARAM)
            : false;
        const matchEnvironment = this.settings[id][key] && _.isString(this.settings[id][key])
            ? this.settings[id][key].match(ENV_CONFIG_PARAM)
            : false;
        if (matchDynamic) {
            return this.value.get(matchDynamic[1]);
        }
        if (matchEnvironment) {
            return process.env[matchEnvironment[1]];
        }
        return this.settings[id][key];
    }

    /**
     * Clean pipe value by key or entirely
     * @param string  key (optional)    
     */
    cls.prototype.clean = function (pipeItemKey) {
        if (!pipeItemKey) {
            for (var key of this.value.keys()) {
                this.value.delete(key)
            }
        } else {
            this.value.delete(pipeItemKey)
        }
        return this.value;
    }
    /**
     * Set pipe value by key
     * @param string - key  
     * @param string - value 
     */
    cls.prototype._set = function (key, value) {
        this.value.set(key, value);
    }

    return cls;
})();
