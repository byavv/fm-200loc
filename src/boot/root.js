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
     * Get all installed services
     */
    router.get('/_private/services', (req, res) => {
        return res.send((global.services || []).map(service => {
            return {
                name: service._name,
                description: service._description,
                settings: service.config
            };
        }));
    });
    /**
     * Get service template by it's name'
     */
    router.get('/_private/service/config/:name', (req, res) => {
        let service = (global.services || [])
            .find((d) => d._name == req.params['name']);
        return res.send({
            name: service._name,
            description: service._description,
            settings: service.config
        });
    });

    /**
     * Get service template by it's name'
     */
    router.get('/_private/service/status/:serviceId', (req, res) => {
        const requiredService = req.params['serviceId'];
        if (requiredService == 'all') {
            const statusArrP = [];
            for (let key of global.servicesStore.keys()) {
                statusArrP.push(_getServiceStatus(key));
            }
            Promise
                .all(statusArrP)
                .then((results) => {
                    return res.send(results);
                });
        } else {
            return res.send(_getServiceStatus(requiredService)
                .then((result) => {
                    statusArr.push(result);
                }));
        }
    });

    function _getServiceStatus(id) {
        let service = global.servicesStore.get(id);
        if (!!service && (typeof service.instance.check == 'function')) {
            return service.instance
                .check()
                .then(result => {
                    return Object.assign({
                        name: service.name,
                        version: service.version,
                        id: id
                    }, result);
                });
        } else {
            return Promise.resolve({
                name: service.name,
                version: service.version,
                status: "N/A",
                message: "Service doesn't provide status checking",
                error: false,
                id: id
            });
        }
    }

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
                    logger.warn(`Error processing test request ${req.originalUrl}, Error:  ${err}`);
                    return tRes.status(200).send({ error: err });
                }
                return tRes.status(200).send({ result: 'ok' });
            });
        });
        const testServer = http.createServer(app).listen();
        const port = testServer.address().port;
        killable(testServer);

        const headers = (req.body.headers || [])
            .reduce(function (acc, cur, i) {
                acc[cur.key] = cur.value;
                return acc;
            }, {});
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
