/**
 * @memberof gateway
 */

"use strict";
const pipeFactory = require('./pipe')
    // Pipe = require('./pipe')
    , global = require('../../global')
    // , Context = require('./context')
    , contextFactory = require('./context')
    , PluginBase = require('./pluginBase')
    , util = require('util')
    ;

module.exports = {
    /**
     * Builds plugins pipe for entry, creates dependencies for all plugins,
     * applies pre-configured settings to them.
     * @param {Array}   plugins     plugins to be added into the entry flow
     */
    build: function (plugins) {
        // const pipe = new Pipe({/* todo: defaults for all plugins in the pipe*/ });
        try {
            const pipe = pipeFactory();
            return plugins.reduce((pluginsArray, plugin, index) => {
                const dependencies = Object.assign({}, plugin.dependencies);
                pipe.insert(plugin.settings, index);
                let deps = {};
                for (let key in dependencies) {
                    if (global.servicesStore.has(dependencies[key])) {
                        deps[key] = global.servicesStore.get(dependencies[key]).instance;
                    } else {
                        throw new Error('Service dependency is not defined');
                    }
                }
                let pluginDefinition = global.plugins.find((p) => p.name === plugin.name);
                if (!pluginDefinition) {
                    throw new Error(`Plugin ${plugin.name} is not found`);
                    // todo. Scenario, when user deletes plugin from config should be notified in UI
                }
                // provides methods to work with pipe and dependencies    
                const Plugin = pluginDefinition.ctr;
                util.inherits(Plugin, PluginBase);
                // let pluginContext = new Context(index, pipe, deps);
                let pluginContext = contextFactory(index, pipe, deps);
                console.log(pluginContext)
                let pluginInstance = new Plugin(pluginContext);
                pluginsArray.push(pluginInstance);
                return pluginsArray;
            }, []);
        } catch (error) {
            console.log('333333333333333333333333333333333333333', error)
        }

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
                if (!global.servicesStore.has(dependencies[key])) {
                    errors.push({
                        name: key,
                        message: `Service dependency ${key} is not defined`
                    });
                }
            }
        });
        return errors;
    }
}
