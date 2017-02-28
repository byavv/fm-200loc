// /**
//  * @module Plugin Pipe builder
//  * @description Provides methods for instantiating plugins with servivces, checking their health state and testing via dashboard
//  */
// "use strict";
// const pipeFactory = require('./pipe')
//     , state = require('../../state')
//     , contextFactory = require('./context')
//     , PluginBase = require('./pluginBase')
//     , util = require('util')
//     ;

// module.exports = {
//     /**
//      * Builds plugins pipe for entry, creates dependencies for all plugins,
//      * applies pre-configured settings to them.
//      * @param {Array}   plugins     plugins to be added into the entry flow
//      */
//     build: function (plugins) {
//         try {
//             const pipe = pipeFactory();
//             return plugins.reduce((pluginsArray, plugin, index) => {
//                 const dependencies = Object.assign({}, plugin.dependencies);
//                 pipe.insert(plugin.settings, index);
//                 let deps = {};
//                 for (let key in dependencies) {
//                     if (state.servicesStore.has(dependencies[key])) {
//                         deps[key] = state.servicesStore.get(dependencies[key]).instance;
//                     } else {
//                         throw new Error('Service dependency is not defined');
//                     }
//                 }
//                 let pluginDefinition = state.plugins.find((p) => p.name === plugin.name);
//                 if (!pluginDefinition) {
//                     throw new Error(`Plugin ${plugin.name} is not found`);
//                     // todo. Scenario, when user deletes plugin from config should be notified in UI
//                 }
//                 // provides methods to work with pipe and dependencies    
//                 const Plugin = pluginDefinition.ctr;
//                 util.inherits(Plugin, PluginBase);
//                 // let pluginContext = new Context(index, pipe, deps);
//                 let pluginContext = contextFactory(index, pipe, deps);
//                 let pluginInstance = new Plugin(pluginContext);
//                 pluginsArray.push(pluginInstance);
//                 return pluginsArray;
//             }, []);
//         } catch (error) {

//         }

//     },
//     /**
//      * Tests for errors in required pipe and constructs error object to be saved in persisted.
//      * Used for notifying of wrong configuration in entry list
//      * @param {Array}   plugins     plugins to be tested
//      */
//     test: function (plugins) {
//         let errors = [];
//         (plugins || []).forEach((plugin) => {
//             const dependencies = Object.assign({}, plugin.dependencies);
//             for (let key in dependencies) {
//                 if (!state.servicesStore.has(dependencies[key])) {
//                     errors.push({
//                         name: key,
//                         message: `Service dependency ${key} is not defined`
//                     });
//                 }
//             }
//         });
//         return errors;
//     }
// }


/**
 * @module Plugin Pipe builder
 * @description Provides methods for instantiating plugins with servivces, checking their health state and testing via dashboard
 */
"use strict";
const pipeFactory = require('./pipe')
    , state = require('../../state')
    , logger = require('../../../lib/logger')
    , contextFactory = require('./context')
    , PluginBase = require('./pluginBase')
    , util = require('util')
    , R = require('ramda')
    ;

module.exports = function () {

    let buildPluginInstanceWithDI = (pipe, dependencies, pluginDefinition) => {
        let Plugin = pluginDefinition.ctr;
        let pluginName = pluginDefinition.name;
        util.inherits(Plugin, PluginBase);
        let pluginContext = contextFactory(pluginName, pipe, dependencies);
        return new Plugin(pluginContext);
    }


    let createAndFillPipeWithPluginProperies = (plugins = []) => {
        const pipe = pipeFactory();
        plugins.forEach((p) => {
            pipe.insert(p.settings, p.name);
        });
        return pipe;
    }


    let getDependenciesForDI = (plugin) => {
        const __depRequired = Object.assign({}, plugin.dependencies);
        let deps = {};
        for (let key in __depRequired) {
            if (state.servicesStore.has(__depRequired[key])) {
                deps[key] = state.servicesStore.get(__depRequired[key]).instance;
            } else {
                throw new Error('Service dependency is not defined');
            }
        }
        return deps;
    }

    let getPluginDefinition = (plugin) => {
        let pluginDefinition = state.plugins.find((p) => p.name === plugin.name);
        if (!pluginDefinition) {
            throw new Error(`Plugin ${plugin.name} is not found`);
            // todo. Scenario, when user deletes plugin from config should be notified in UI
        }
        return pluginDefinition;
    }


    return {
        /**
         * Builds plugins pipe for entry, creates dependencies for all plugins,
         * applies pre-configured settings to them.
         * @param {Array}   plugins     plugins to be added into the entry flow
         */
        build: function (plugins) {
            try {
                const pipe = createAndFillPipeWithPluginProperies(plugins);
                const deferP = R.curry(buildPluginInstanceWithDI)(pipe);

                return R.reduce((aggr, plugin) => {
                    let pluginInstance = R.useWith(deferP, [
                        getDependenciesForDI,
                        getPluginDefinition
                    ])(plugin)(plugin);
                    aggr.push(pluginInstance);
                    return aggr;
                }, [], plugins);
            } catch (error) {
                logger.error(error)
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
}
