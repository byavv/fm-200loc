/*jslint node: true */
'use strict';
const http = require('http'),
    path = require('path'),
    debug = require('debug')('gateway'),
    minimist = require('minimist'),
    redis = require('redis'),
    _ = require('lodash'),
    fork = require('child_process').fork;
;

const defaults = {
    string: ['env', 'll', 'n', "p"],
    default: {
        env: process.env.NODE_ENV || 'development',
        ll: process.env.LOG_LEVEL || 'debug',
        n: process.env.NODE_NAME || `node-${Math.random().toString(36).substring(2, 7)}`,
        p: process.env.HTTP_PORT || 3001
    }
};
const options = minimist(process.argv.slice(2), defaults);
process.env.NODE_ENV = options.env;
process.env.LOG_LEVEL = _.isArray(options.ll) ? [...options.ll].pop() : options.ll;
process.env.NODE_NAME = _.isArray(options.n) ? [...options.n].pop() : options.n;
process.env.HTTP_PORT = _.isArray(options.p) ? [...options.p].pop() : options.p;

const gateway = fork(path.join(__dirname, 'gateway/src/server.js'), {
    env: process.env, silent: false
});

gateway.on("message", function (message) {
    console.log(message)
});
process.once("SIGTERM", function () {
    process.exit(0);
});
process.once("SIGINT", function () {
    process.exit(0);
});
process.once("exit", function (code) {
    console.log('Terminating by user...')
    gateway.kill("SIGTERM");
});

process.once("uncaughtException", function (error) {
    if (process.listeners("uncaughtException").length === 0) {
        gateway.kill();
        throw error;
    }
});
