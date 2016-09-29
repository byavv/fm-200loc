/*jslint node: true */
'use strict';
const path = require("path"),
    async = require('async'),
    request = require('request')
    ;

module.exports = function (app) {
    var router = app.loopback.Router();
    var ApiConfig = app.models.ApiConfig;   

    router.get('/api/configs', (req, res) => {
        ApiConfig.find((err, configs) => {
            res.send(configs);
        });
    });
    
    router.get('/api/plugins', (req, res, next) => {
        request({
            url: `http://${process.env.GATEWAY}/_private/plugins`,
            method: 'GET'
        }, function (err, responce, body) {
            if (err) return next(err)
            if (responce) {
                return res.status(responce.statusCode).send(body)
            } else {
                return res.sendStatus(500)
            }
        });
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
        request({
            url: `http://${process.env.GATEWAY}/_private/drivers`,
            method: 'GET'
        }, function (err, responce, body) {
            if (err) return next(err)
            if (responce) {
                return res.status(responce.statusCode).send(body)
            } else {
                return res.sendStatus(500)
            }
        });
    });
    /**
     * Get driver template by it's name'
     */
    router.get('/api/driver/config/:name', (req, res) => {
        const name = req.params['name'];
        request({
            url: `http://${process.env.GATEWAY}/_private/driver/config/${name ? name : ''}`,
            method: 'GET'
        }, function (err, responce, body) {
            if (err) return next(err)
            if (responce) {
                return res.status(responce.statusCode).send(body)
            } else {
                return res.sendStatus(500)
            }
        });
    });
    app.use(router);
};