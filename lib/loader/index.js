/*jslint node: true */
'use strict';
const path = require("path"),
    fs = require("fs"),
    async = require('async'),
    logger = require('../logger')
    ;

module.exports = function () {
    return {
        // actually we do not need promice here, just for the future
        loadComponentFromPath: function (fromPath) {
            logger.info(`Loading components from ${fromPath}`);
            return new Promise((resolve, reject) => {
                if (fs.existsSync(path.resolve(`${fromPath}/package.json`))) {
                    let pluginPackage = require(`${fromPath}/package.json`);
                    let ctr = require(path.join(fromPath, pluginPackage.main));
                    let uiConfig = pluginPackage.uiConfig;
                    if (!ctr || !uiConfig || !pluginPackage.name) {
                        reject(`Wrong config for : ${fromPath}`)
                    }
                    let dependencies = pluginPackage.$require;
                    resolve({
                        ctr: ctr, // component constructor function
                        config: uiConfig || {}, // configuration for UI form to be filled
                        dependencies: dependencies || [], // component dependenciies from $required field. Plugins future. Services are injectable
                        name: pluginPackage.name, // name is the key for component. No double versuin can be loaded with the same name
                        version: pluginPackage.version || '0.0.0',
                        description: pluginPackage.description || ''
                    });
                } else {
                    reject(`No plugin found in provided path: ${fromPath}`);
                }
            });
        }
    };
}
