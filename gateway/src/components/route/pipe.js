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
    const prefix = 'plugin_';
    const cls = function () {
        this._storage = new Map();
    }

    cls.prototype.insert = function (settings, index) {
        this._storage.set(`${prefix}:${index}`, settings);
    }

    /**
     * Get stored value by key
     * @param string  key  - key
     * @param string  id   - plugin identificator
     */
    cls.prototype._get = function (key, id) {
        var requiredParam = this._storage.get(`${prefix}:${id}`);
        if (!requiredParam) throw new Error(`No config found ${id}: ${key}`);

        /* 
        find all dynamic parameters and provide getting values
        from global pipe object stored by another plugin above
        in the pipe:

                e.g.:    ${param}

        or from process environment: 

                e.g.:    env{param}

        */

        const matchDynamic = requiredParam[key] && _.isString(requiredParam[key])
            ? requiredParam[key].match(DYNAMIC_CONFIG_PARAM)
            : false;
        const matchEnvironment = requiredParam[key] && _.isString(requiredParam[key])
            ? requiredParam[key].match(ENV_CONFIG_PARAM)
            : false;
        if (matchDynamic) {
            return this._storage.get(matchDynamic[1]);
        }
        if (matchEnvironment) {
            return process.env[matchEnvironment[1]];
        }
        return requiredParam[key];
    }

    /**
     * Set pipe value by key
     * @param string key - key  
     * @param string value - value 
     */
    cls.prototype._set = function (key, value) {
        this._storage.set(key, value);
    }

    /**
     * Clean storage value(s) by key or entirely
     * @param string  key (optional)    
     */
    cls.prototype.clean = function (pipeItemKey) {
        if (!pipeItemKey) {
            this._storage.clear();
        } else {
            this._storage.delete(pipeItemKey);
        }
    }

    return cls;
})();
