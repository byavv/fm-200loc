"use strict"
const async = require('async')
    , debug = require('debug')('gateway, explorer')
    , redis = require('redis')

module.exports = function (DriverConfig) {
    let app, publisher;

    DriverConfig.on('attached', function (a) {
        app = a;
        if (process.env.NODE_ENV != 'test')
            publisher = redis.createClient({
                host: app.get('redis_host'),
                port: 6379
            });
    });

    DriverConfig.observe('after save', function (ctx, next) {        
        if (process.env.NODE_ENV != 'test')
            publisher.publish("cluster", JSON.stringify({ action: "update" }));
        next();
    });

    DriverConfig.observe('after delete', function (ctx, next) {
        if (process.env.NODE_ENV != 'test')
            publisher.publish("cluster", JSON.stringify({ action: "update" }));
        next();
    });
};
