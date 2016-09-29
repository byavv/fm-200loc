/*jslint node: true */
'use strict';
const path = require("path"),
    async = require('async'),
    global = require('../global');
;

module.exports = function (app) {
    var router = app.loopback.Router();    
    /**
     * Get all installed plugins
     */
    router.get('/_private/plugins', (req, res) => {
        return res.send((global.plugins || []).map(plugin => {
            return {
                name: plugin._name,
                description: plugin._description,
                settingsTemplate: plugin.config,
                dependenciesTemplate: plugin.dependencies,
                value: {}
            };
        }));
    });

    /**
     * Get all installed drivers
     */
    router.get('/_private/drivers', (req, res) => {
        return res.send((global.drivers || []).map(driver => {
            return {
                name: driver._name,
                description: driver._description,
                settings: driver.config
            };
        }));
    });
    /**
     * Get driver template by it's name'
     */
    router.get('/_private/driver/config/:name', (req, res) => {
        let driver = (global.drivers || [])
            .find((d) => d._name == req.params['name']);
        return res.send({
            name: driver._name,
            description: driver._description,
            settings: driver.config
        });
    });
    app.use(router);
}; 
