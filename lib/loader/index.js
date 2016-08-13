/*jslint node: true */
'use strict';
const path = require("path"),
    fs = require("fs"),
    async = require('async'),
    logger = require('../logger')
    ;

module.exports = function () {
    return {
        loadPlugins: function (pluginsDirPath) {
            let plugins = [];
            logger.info(`Loading plugins`);
            return new Promise((resolve, reject) => {
                fs.readdir(pluginsDirPath, (err, files) => {
                    logger.info(`${files.length} plugins available`);
                    if (err) reject(err);
                    async.each(files, (file, callback) => {
                        try {
                            let plugin = require(path.join(pluginsDirPath, file));
                            let configPath = path.join(pluginsDirPath, plugin._name, 'config.json')
                            fs.exists(configPath, (exists) => {
                                try {
                                    plugin.config = exists ? require(configPath) : {};
                                    logger.debug(`Loaded plugin: ${plugin._name} (${plugin._description})`);
                                    plugins.push(plugin);
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
                            console.log(err)
                            reject(err);
                        } else {
                            resolve(plugins);
                        };
                    });
                });
            });
        }
    };
}
