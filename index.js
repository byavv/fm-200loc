/*jslint node: true */
'use strict';
const http = require('http'),
    path = require('path'),
    debug = require('debug')('gateway'),
    minimist = require('minimist')
    ;

const defaults = {
    string: ['env', 'log'],
    default: {
        env: process.env.NODE_ENV || 'development',
        log: process.env.LOG_LEVEL || 'debug',
    }
};
const options = minimist(process.argv.slice(2), defaults);
process.env.NODE_ENV = options.env;
process.env.LOG_LEVEL = options.log;

const logger = require('./lib/logger');
const loader = require('./lib/loader')();
//const driverLoader = require('./lib/driverLoader')();

const http_port_gate = process.env.GATE_HTTP_PORT || 3001,
    http_port_exp = process.env.EXPLORER_HTTP_PORT || 5601;

if (!process.env.GATE_HTTP_PORT) logger.warn(`Gateway http port is not set, use default: ${http_port_gate}`)
if (!process.env.EXPLORER_HTTP_PORT) logger.warn(`Explorer http port is not set, use default: ${http_port_exp}`)

Promise.all([
    loader
        .loadComponents(path.resolve(__dirname, './plugins')),
    loader
        .loadComponents(path.resolve(__dirname, './drivers'))
])
    .then((components) => {       
        logger.debug('Drivers and plugins loaded, init servers...');
        const gateway = require('./gateway/src/server');
        const explorer = require('./explorer/server/server');
        return Promise.all([
            explorer.init(components[0], components[1]),
            gateway.init(components[0], components[1])
        ])
            .then(apps => {
                logger.debug('Init complete, starting...')
                apps[0].start(http_port_exp);
                apps[1].start(http_port_gate);
            });
    })
    .catch(err => {
        //  logger.error(err)
        console.log(err)
        throw err;
    });
