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
    var ApiConfig = app.models.ApiConfig;
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
    router.get('/_private/service/status/:forId', (req, res) => {
        const requiredService = req.params['forId'];
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
            let requiredServices = [];
            ApiConfig.findById(requiredService)
                .then((config) => {
                    config.plugins.forEach(pl => {
                        if (pl.dependencies) {
                            Object.keys(pl.dependencies)
                                .forEach(key => {
                                    requiredServices.push(pl.dependencies[key]);
                                })
                        }
                    })

                    return requiredServices;

                }).then(required => {
                    const statusArrP = [];
                    for (let key of required) {
                        statusArrP.push(_getServiceStatus(key));
                    }
                    Promise
                        .all(statusArrP)
                        .then((results) => {
                            return res.send(results);
                        }, (err) => {
                            return res.status(500).send(results);
                        });
                });
        }
    });

    router.get('/_private/service/summary/:id', (req, res) => {
        const id = req.params['id'];
        let service = global.servicesStore.get(id);
        if (!!service && service.instance) {
            service.instance
                .summary()
                .then(result => {
                    return res.send(Object.assign({
                        name: service.name,
                        version: service.version,
                        id: id
                    }, result));
                });
        } else {
            return res.send({
                name: service.name,
                version: service.version,
                id: id
            });
        }
    })

    function _getServiceStatus(id) {
        let service = global.servicesStore.get(id);
        if (service && service.instance) {
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
            return Promise.reject('No service found');
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
