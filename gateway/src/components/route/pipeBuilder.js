/**
 * @module Route Component
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Provides core functionality to build entry pipe.
 **/

"use strict";
const Pipe = require('./pipe')
    , global = require('../../global')
    , PluginBase = require('./pluginBase')
    , inherit = require("../../../../lib/inherits")
    ;

/**
 * Builds plugins pipe for entry, creates dependencies for all plugins,
 * applies pre-configured settings to them.
 * @method buildPipeFromPlugins
 * @param {Array} plugins -  plugins to be added into the flow
 */
module.exports = function buildPipeFromPlugins(plugins) {
    const pipe = new Pipe({/* todo: defaults for all plugins */ })
    const pluginsArray = [];

    plugins.forEach((plugin, index) => {
        const dependencies = Object.assign({}, plugin.dependencies);
        pipe.insert(plugin.settings, index);
        let deps = [];
        for (let key in dependencies) {
            if (global.driversStore.has(dependencies[key])) {
                deps.push(global.driversStore.get(dependencies[key]))
            } else {
                throw new Error('Driver is not defined');
            }
        }
        let Plugin = global.plugins.find((p) => p._name === plugin.name);
        if (!Plugin) {
            const DefaultPlugin = require('./defaultPlugin');
            pluginsArray.push(new DefaultPlugin(plugin.name));
        } else {
            // provides methods to work with pipe and dependencies
            inherit(Plugin, PluginBase);
            let plugin = new Plugin(index, pipe, deps);
            pluginsArray.push(plugin);
        }
    });
    return pluginsArray;
}
