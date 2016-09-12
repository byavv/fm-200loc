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
                                    console.log(options)
                                    component.config = options.config || {};
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
        }
    };
}
