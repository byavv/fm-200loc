'use strict';
/*jslint node: true */
let httpProxy = require('http-proxy'),
    errors = require('../../lib/errors'),
    debug = require('debug')('services:proxy'),
    logger = require('../../lib/logger'),
    Memcached = require('memcached')
    ;

module.exports = (function () {
    let cls = function (app, serviceConfig) {
        this.client = new Memcached('memcached-15301.c10.us-east-1-3.ec2.cloud.redislabs.com:15301');

        this.get = function (key, clb) {
            this.client.get(key, function (err, data) { clb(err, data) });
        }

        this.set = function (key, value, ttl, clb) {
            this.client.set(key, value, ttl, function (err) { clb(err) });
        }

        this.check = function () {
            return new Promise((resolve, reject) => {
                this.client.version((err, result) => {
                    if (err) reject(err);
                    resolve(result)
                })
            });
        }

        this.summary = function () {
            return new Promise((resolve, reject) => {
                this.client.version((result) => {
                    resolve({
                        error: false,
                        message: result,
                        name: 'Http-proxy'
                    })
                });
            });
        }
    };
    return cls;
})();
