/**
 * @module Plugin Pipe builder
 * @description Provides methods for instantiating plugins with servivces, checking their health state and testing via dashboard
 */
"use strict";
const pipeFactory = require('./pipe')
    , state = require('../../state')
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
        try {
            const pipe = pipeFactory();
            return plugins.reduce((pluginsArray, plugin, index) => {
                const dependencies = Object.assign({}, plugin.dependencies);
                pipe.insert(plugin.settings, index);
                let deps = {};
                for (let key in dependencies) {
                    if (state.servicesStore.has(dependencies[key])) {
                        deps[key] = state.servicesStore.get(dependencies[key]).instance;
                    } else {
                        throw new Error('Service dependency is not defined');
                    }
                }
                let pluginDefinition = state.plugins.find((p) => p.name === plugin.name);
                if (!pluginDefinition) {
                    throw new Error(`Plugin ${plugin.name} is not found`);
                    // todo. Scenario, when user deletes plugin from config should be notified in UI
                }
                // provides methods to work with pipe and dependencies    
                const Plugin = pluginDefinition.ctr;
                util.inherits(Plugin, PluginBase);
                // let pluginContext = new Context(index, pipe, deps);
                let pluginContext = contextFactory(index, pipe, deps);
                let pluginInstance = new Plugin(pluginContext);
                pluginsArray.push(pluginInstance);
                return pluginsArray;
            }, []);
        } catch (error) {

        }

    },
    /**
     * Tests for errors in required pipe and constructs error object to be saved in persisted.
     * Used for notifying of wrong configuration in entry list
     * @param {Array}   plugins     plugins to be tested
     */
    test: function (plugins) {
        let errors = [];
        (plugins || []).forEach((plugin) => {
            const dependencies = Object.assign({}, plugin.dependencies);
            for (let key in dependencies) {
                if (!state.servicesStore.has(dependencies[key])) {
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
