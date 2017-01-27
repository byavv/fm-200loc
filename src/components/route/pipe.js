"use strict"; 
const _ = require('lodash');

/**
 * Represents pipe entry pipe object
 */
module.exports = (function () {
    /** @constant {regexp} */
    const DYNAMIC_CONFIG_PARAM = /\$\{(\w+)\}$/;
    /** @constant {regexp} */
    const ENV_CONFIG_PARAM = /\env\{(\w+)\}$/;
    /** @constant {string} */
    const prefix = 'plugin_';

    /** @constructs Pipe*/
    const cls = function () {
        this._storage = new Map();
    }
    /**
     * Add new parameter into pipe object, prefixing by plugin id
     * 
     * @function
     * @param   {Object}    settings    Key value to be stored
     * @param   {number}    index       plugin identificator     
     */
    cls.prototype.insert = function (settings, index) {
        this._storage.set(`${prefix}:${index}`, settings);
    }

    /**
     * Get plugin-related stored object by key
     * 
     * @function
     * @param   {string}    key     key
     * @param   {string}    id      plugin identificator   
     * @example   
     *  
     * pipe._get('myParam',0);         // get plugin-related parameter
     * pipe._get('${myParam}',0);      // get stored in pipe parameter
     * pipe._get('env{myParam}',0);    // get environment param    
     *  
     * @returns {Object}            Stored object (pipe or plugin related)
     */
    cls.prototype._get = function (key, id) {
       // console.log(this._storage)
        var requiredParam = this._storage.get(`${prefix}:${id}`);
        if (!requiredParam) throw new Error(`No config found ${id}: ${key}`);
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
     * 
     * @function
     * @param {string}  key     key  
     * @param {string}  value   value 
     */
    cls.prototype._set = function (key, value) {
        this._storage.set(key, value);
    }

    /**
     * Clean storage value(s) by key or entirely
     * 
     * @function
     * @param {string}  key (optional)    
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
