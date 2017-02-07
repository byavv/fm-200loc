"use strtict"
const boot = require('loopback-boot')
    , http = require('http')
    , loopback = require('loopback')
    , minimist = require('minimist')
    , buildGatewayTable = require('./components/route')
    , debug = require('debug')('gateway')
    , redis = require('redis')
    , path = require('path')
    , program = require('commander')
    , _ = require('lodash')
    ;

const app = module.exports = loopback();

const mongo_host = process.env.MONGO_HOST || "localhost";
const redis_host = process.env.REDIS_HOST || "localhost";
const etcd_host = process.env.ETCD_HOST || "localhost";

const logger = require('../lib/logger');
const loader = require('../lib/loader')();
const global = require('./global');

program
    .version('1.21.0')
    .option('-p, --port [value]', 'Select Port', parseInt, 3001)
    .option('-l, --log [value]', 'Specify log level', 'debug')
    .option('-n, --node [value]', 'Set Node name', `node-${Math.random().toString(36).substring(2, 7)}`)
    .option('-u, --user [user]', 'Set User name')
    .option('-x, --password [value]', 'Set Password')
    .option('-e, --environment [value]', 'Define environment', /^(development|production|test)$/i, 'development')
    .option('-c, --config [value]', 'Specify Config Filepath', process.cwd())
    .parse(process.argv);

let node_name;
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : program.environment;
process.env.LOG_LEVEL = program.log;
process.env.NODE_NAME = node_name = program.node;
process.env.HTTP_PORT = program.port || 3001;
process.env.CONFIG_PATH = program.config;


app.set("mongo_host", mongo_host);
app.set("redis_host", redis_host);
app.set("etcd_host", etcd_host);
app.set("node_name", node_name);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.disable('x-powered-by');

const http_port = process.env.HTTP_PORT;

if (process.env.NODE_ENV != 'test') {
    const sub = redis.createClient({
        host: app.get('redis_host'),
        port: 6379
    });

    sub.on("message", function (channel, message) {
        message = JSON.parse(message);
        if (message.action == 'update') {
            restart();
        }
    });
    sub.subscribe("cluster");
}

function restart() {
    global.ready = false;
    buildGatewayTable(app)
        .then(() => {
            global.ready = true;
            debug(`Node ${app.get('node_name')} configuration updated`);
        });
}


boot(app, __dirname, (err) => {
    if (err) throw err;
    app.start = function () {
        logger.info('Gateway starting...');
        Promise.all([
            loader // todo: load from configuration file
                .loadComponents(path.resolve(__dirname, '../plugins')),
            loader // todo: load from configuration file
                .loadComponents(path.resolve(__dirname, '../drivers'))
        ])
            .then(([plugins, services]) => {
                global.plugins = plugins;
                global.services = services;
                global.ready = true;
            })
            .then(() => buildGatewayTable(app))
            .then(() => {
                const httpServer = http.createServer(app)
                    .listen(http_port, () => {
                        app.emit('started');
                        app.close = (done) => {
                            app.removeAllListeners('started');
                            app.removeAllListeners('loaded');
                            httpServer.close(done);
                        };
                        process.once("SIGTERM", () => {
                            app.close(() => { process.exit(0); });
                        });
                        logger.info(`Gateway node ${app.get('node_name')} started on ${http_port}`)
                    });
            }).catch((err) => {
                logger.error(err);
                process.exit(-1);
            });
    };

    if (require.main === module)
        app.start();
    app.loaded = true;
    app.emit('loaded');
});
