/**
 * @module Plugin Pipe Storage
 */

/**
 * @module Plugin Pipe Storage
 * @typedef Pipe
 * @type {object}
 * @property {Function} getItem - get item from pipe storage.
 * @property {Function} setItem - set item to pipe storage
 * @property {Function} clean - clean storage
 */
"use strict";
const _ = require('lodash');

/**
 * Creates a new pipe object for request processing.
 * @description 
 * Methods for parsing parameters and saving them in inner storage
 * to accessable for all plugins in a pipe via context 
 * @function pipeFactory
 * @example
 * const pipe = pipeFactory();
 * @returns {Pipe} pipe object
 */
module.exports = (function () {
    /** @constant {regexp} */
    const DYNAMIC_CONFIG_PARAM = /\$\{(\w+)\}$/;
    /** @constant {regexp} */
    const ENV_CONFIG_PARAM = /\env\{(\w+)\}$/;
    /** @constant {string} */
    const prefix = 'plugin_';
    /**
     * This provides methods for working with formatting of parameters string     
     *
     * @mixin
     */
    const base = {
        /**
         * Set key value lovercase
         * 
         * @inner pipeFactory
         * @function         
         * @param   {string}    key
         * @returns {string}    normalized key    
         */
        normalize(keyStr) {
            return keyStr.toLowerCase();
        },
        /**
         * Check if pattern match to any of key patterns
         * 
         * @function
         * @param   {string}    key
         * @returns {Object}    pattern matched   
         */
        match(pattern) {
            const dynamic = pattern && _.isString(pattern)
                ? pattern.match(DYNAMIC_CONFIG_PARAM)
                : false;
            const environment = pattern && _.isString(pattern)
                ? pattern.match(ENV_CONFIG_PARAM)
                : false;
            return { dynamic, environment };
        }
    }
    function pipeFactory() {
        const pipe = {
            getItem(key, id) {
                var requiredParam = this._get(`${prefix}:${id}`);
                if (!requiredParam) throw new Error(`No config found ${id}: ${key}`);
                let paramType = this.match(requiredParam[key]);

                if (paramType.dynamic) {
                    return this._get(paramType.dynamic[1]);
                }
                if (paramType.environment) {
                    return process.env[paramType.environment[1]];
                }
                return requiredParam[key];
            },
            setItem(key, value) { return this._set(...arguments) },
            insert(settings, index) {
                this._set(`${prefix}:${index}`, settings);
            },
            _set(key, value) { return this._map.set(this.normalize(key), value) },
            _get(key) { return this._map.get(key) },
            _map: new Map(),
            clean(pipeItemKey) {
                if (!pipeItemKey) {
                    this._map.clear();
                } else {
                    this._map.delete(pipeItemKey);
                }
            }
        };
        return Object.assign(Object.create(base), pipe);
    }
    return pipeFactory;
})();
