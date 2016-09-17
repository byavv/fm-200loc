/*jslint node: true */
'use strict';
const path = require("path"),
    async = require('async');

module.exports = function (app) {
    var router = app.loopback.Router();
    var ApiConfig = app.models.ApiConfig;
    var DriverConfig = app.models.DriverConfig;

    router.get('/api/configs', (req, res) => {
        ApiConfig.find((err, configs) => {
            res.send(configs);
        });
    });

    router.get('/api/config/:id', (req, res) => {
        ApiConfig.findById(req.params.id, (err, config) => {
            res.send(config);
        });
    });

    router.post('/api/config/:id', (req, res) => {
        ApiConfig.findOrCreate({ where: { id: req.params.id } }, req.body, (err, config) => {
            if (err) {
                return res.status(err.statusCode).send(err.message);
            }
            config.updateAttributes(req.body, (err, cf) => {
                if (err) return res.sendStatus(500);
                return res.status(200).send(cf);
            });
        });
    });
    /**
     * Get all installed plugins
     */
    router.get('/api/plugins', (req, res) => {
        return res.send((req.app.plugins || []).map(plugin => {
            return {
                name: plugin._name,
                description: plugin._description,
                settingsTemplate: plugin.config,
                dependenciesTemplate: plugin.dependencies,
                value: {}
            };
        }));
    });

    router.delete('/api/config/:id', (req, res) => {
        ApiConfig.destroyById(req.params.id, (err, result) => {
            if (err) return res.sendStatus(500);
            return res.send(result);
        });
    });
    /**
     * Get all installed drivers
     */
    router.get('/api/drivers', (req, res) => {
        return res.send((req.app.drivers || []).map(driver => {
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
    router.get('/api/driver/config/:name', (req, res) => {
        let driver = (req.app.drivers || [])
            .find((d) => d._name == req.params['name']);
        return res.send({
            name: driver._name,
            description: driver._description,
            settings: driver.config
        });
    });
    app.use(router);
};