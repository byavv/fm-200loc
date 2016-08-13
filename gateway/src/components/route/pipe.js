/*jslint node: true */
"use strict";
const logger = require('../../../../lib/logger');

module.exports = (function () {
    let cls = function (defaults = {}) {
        let data = new Map();
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

    cls.prototype.clean = function () {
        for (var key of this.value.keys()) {
            this.value.delete(key)
        }
        return this.value;
    }

    cls.prototype.set = function (key, value) {
        this.value.set(key, value);
    }

    return cls;
})();
