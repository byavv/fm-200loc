/*jslint node: true */
"use strict";
const logger = require('../../../../lib/logger');

module.exports = (function () {
    const cls = function (defaults = {}) {
        const data = new Map();
        Object.keys(defaults).forEach(key => {
            data.set(key, defaults[key]);
        });
        Object.defineProperty(this, 'value', {
            get: function () { return data; }
        })
    }
    cls.prototype.get = function (key) {
        if (!key) return this.value;
        return this.value.get(key);
    }

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

    cls.prototype.set = function (key, value) {
        this.value.set(key, value);
    }

    return cls;
})();
