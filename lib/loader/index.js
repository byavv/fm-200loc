/*jslint node: true */
'use strict';
const path = require("path"),
    fs = require("fs"),
    async = require('async'),
    logger = require('../logger')
    ;

module.exports = function () {
    return {
        loadComponents: function (fromPath) {
            let components = [];
            logger.info(`Loading components`);
            return new Promise((resolve, reject) => {
                fs.readdir(fromPath, (err, files) => {
                    logger.info(`${files.length} components available`);
                    if (err) reject(err);
                    async.each(files, (file, callback) => {
                        try {
                            let component = require(path.join(fromPath, file));
                            let configPath = path.join(fromPath, component._name, 'config.json')
                            fs.exists(configPath, (exists) => {
                                try {
                                    let options = exists ? require(configPath) : {};
                                    component.config = options.config || {};
                                    component.dependencies = options.$require || [];
                                    logger.debug(`Loaded component: ${component._name} (${component._description})`);
                                    components.push(component);
                                    callback();
                                } catch (error) {
                                    callback(error);
                                }
                            });
                        } catch (error) {
                            callback(error);
                        }
                    }, (err) => {
                        if (err) {
                            logger.error(err)
                            reject(err);
                        } else {
                            resolve(components);
                        };
                    });
                });
            });
        },
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
