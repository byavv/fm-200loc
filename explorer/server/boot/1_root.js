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

    router.get('/api/plugins', (req, res) => {
        return res.send((req.app.plugins || []).map(plugin => {
            return {
                name: plugin._name,
                description: plugin._description,
                settings: plugin.config
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
    /**
     * 
     */
  /*  router.get('/api/driver/:name', (req, res) => {
        DriverConfig.find({ where: { driverId: req.params['name'] } }, (err, driverConfigs) => {
            if (err) return res.sendStatus(500);
            return res.send(driverConfigs);
        });
    });


    router.get('/api/driver/:id', (req, res) => {
        DriverConfig.findById(req.params['id'], (err, driverConfig) => {
            //  DriverConfig.findOne({ where: { name: req.params['name'] } }, (err, driverConfigs) => {
            if (err) return res.sendStatus(500);
            return res.send(driverConfig);
        });
    });*/

   /* router.post('/api/driver/:id', (req, res) => {
        console.log(req.body)
        DriverConfig.findOrCreate({ where: { id: req.params.id } }, req.body, (err, driverConfigConfig) => {
            if (err) {
                return res.status(err.statusCode).send(err.message);
            }
            driverConfigConfig.updateAttributes(req.body, (err, cf) => {
                if (err) return res.sendStatus(500);
                return res.status(200).send(cf);
            });
        });
    });
*/
   /* router.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../build/index.html'));
    });*/

    app.use(router);
    console.log('root')
    
};