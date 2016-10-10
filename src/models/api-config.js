
"use strict"
const async = require('async')
    , debug = require('debug')('gateway, explorer')
    , redis = require('redis')

module.exports = function (ApiConfig) {
    let app, publisher;

    ApiConfig.on('attached', function (a) {
        app = a;
        if (process.env.NODE_ENV != 'test')
            publisher = redis.createClient({
                host: app.get('redis_host'),
                port: 6379
            });
    });

    ApiConfig.observe('after save', function (ctx, next) {
        if (process.env.NODE_ENV != 'test')
        publisher.publish("cluster", JSON.stringify({ action: "update" }));
        next();
    });
}