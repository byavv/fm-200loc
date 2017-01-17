/*jslint node: true */
'use strict';
const path = require("path"),
    async = require('async'),
    pipeBuilder = require('../components/route/pipeBuilder'),
    logger = require('../../lib/logger'),
    debug = require('debug')('gateway'),
    global = require('../global'),
    http = require('http'),
    express = require('express'),
    request = require('request'),
    killable = require('killable')
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
    /**
     * Test entry
     */
    router.post('/_private/entry/test', (req, res) => {
        const app = express();
        app.use((tReq, tRes, next) => {
            let plugins = req.body.plugins;         
            const pipe = pipeBuilder.build(plugins);
            const handlers = (pipe || [])
                .map(plugin => {
                    return plugin.handler.bind(plugin, tReq, tRes);
                });
            async.series(handlers, (err) => {
                if (err) {
                    logger.warn(`Error processing ${req.originalUrl}, ${err}`);                    
                    return next(err);
                }
                return res.status(200).send({ result: 'ok' });
            });
        });
        const testServer = http.createServer(app).listen();
        const port = testServer.address().port;     
        killable(testServer);
        const headers = req.body.headers;
        const method = req.body.method;
        const body = req.body.body;
        // todo: const params = req.body.params
        const options = {
            url: `http://localhost:${port}`,
            headers: headers,
            method: method
        };
        if (body && method == 'POST') options.json = body;
        request(options, (error, response, body) => {          
            testServer.kill(() => {
                debug(`Test server on port ${port} killed`);
                res.status(200).send({ error, response, body });
            });
        });
    });
    app.use(router);
}; 
