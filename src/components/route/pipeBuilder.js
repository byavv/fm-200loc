/**
 * @memberof gateway
 */

"use strict";
const Pipe = require('./pipe')
    , global = require('../../global')
    , Context = require('./context')
    ;

module.exports = {
    /**
     * Builds plugins pipe for entry, creates dependencies for all plugins,
     * applies pre-configured settings to them.
     * @param {Array}   plugins     plugins to be added into the entry flow
     */
    build: function (plugins) {
        const pipe = new Pipe({/* todo: defaults for all plugins */ });
        return plugins.reduce((pluginsArray, plugin, index) => {
            const dependencies = Object.assign({}, plugin.dependencies);
            pipe.insert(plugin.settings, index);
            let deps = {};
            for (let key in dependencies) {
                if (global.driversStore.has(dependencies[key])) {
                    deps[key] = global.driversStore.get(dependencies[key]).instance;
                } else {
                    throw new Error('Service dependency is not defined');
                }
            }
            let Plugin = global.plugins.find((p) => p._name === plugin.name);
            if (!Plugin) {
                const DefaultPlugin = require('./defaultPlugin');
                pluginsArray.push(new DefaultPlugin(plugin.name));
            } else {
                // provides methods to work with pipe and dependencies               
                let ctx = new Context(index, pipe, deps)
                let plugin = new Plugin(ctx);
                pluginsArray.push(plugin);
            }
            return pluginsArray;
        }, []);
    },
    /**
     * Tests for errors in required pipe and constructs erro object to be saved in persisted.
     * Used for notifying of wrong configuration in entry list
     * @param {Array}   plugins     plugins to be tested
     */
    test: function (plugins) {
        let errors = [];
        (plugins || []).forEach((plugin) => {
            const dependencies = Object.assign({}, plugin.dependencies);
            for (let key in dependencies) {
                if (!global.driversStore.has(dependencies[key])) {
                    let e = {};
                    e[key] = {
                        massage: `Service dependency ${key} is not defined`
                    }
                    errors.push(e);
                }
            }
        });
        return errors;
    }
}
