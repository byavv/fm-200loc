"use strtict"
const boot = require('loopback-boot')
    , http = require('http')
    , loopback = require('loopback')
    , buildApiTable = require('./components/route')
    , debug = require('debug')('gateway')
    , redis = require('redis')
    , path = require('path')
    , program = require('commander')
    , _ = require('lodash')
    , cluster = require('cluster')
    , os = require('os')
    , fs = require('fs')
    ;

const app = module.exports = loopback();

const mongo_host = process.env.MONGO_HOST || "localhost";
const redis_host = process.env.REDIS_HOST || "localhost";
const etcd_host = process.env.ETCD_HOST || "localhost";

const logger = require('../lib/logger');
const loader = require('../lib/loader')();
const state = require('./state');

program
    .version('0.0.1-alpha')
    .option('-p, --port [value]', 'Select Port', parseInt, 3001)
    .option('-l, --log [value]', 'Specify log level', 'debug')
    .option('-n, --node [value]', 'Set Node name', `node-${Math.random().toString(36).substring(2, 7)}`)
    .option('-u, --user [user]', 'Set User name')
    .option('-x, --password [value]', 'Set Password')
    .option('-e, --environment [value]', 'Define environment', /^(development|production|test)$/i, 'development')
    .option('-c, --config [value]', 'Specify Config Filepath', process.cwd())
    .option('-m, --multithread [value]', 'Run in cluster mode', false)
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
        // host: app.get('redis_host'),
        // port: 6379
        host: `redis-11757.c10.us-east-1-2.ec2.cloud.redislabs.com`,
        port: '11757'
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
    state.ready = false;
    buildApiTable(app)
        .then(() => {
            state.ready = true;
            debug(`Node ${app.get('node_name')} configuration updated`);
        });
}

boot(app, __dirname, (err) => {
    if (err) throw err;
    app.start = function () {
        const configPath = path.resolve(program.config, 'LocConfig.json');
        if (!fs.existsSync(configPath)) {
            return exitWithError('No configuration file found');
        };
        let config = require(configPath);
        if ((!config.services || !Array.isArray(config.services))) {
            return exitWithError('Configuration has wrong format');
        }
        if ((!config.plugins || !Array.isArray(config.plugins))) {
            return exitWithError('Configuration has wrong format');
        }
        logger.info(`Gateway is starting with ${configPath}.`);
        let services = config.services;
        let plugins = config.plugins;
        Promise.all([
            Promise.all(plugins.map((pluginLoadingConfig) => {
                return loader.loadComponentFromPath(path.resolve(process.cwd(), pluginLoadingConfig.path));
            })),
            Promise.all(services.map((serviceLoadingConfig) => {
                return loader.loadComponentFromPath(path.resolve(process.cwd(), serviceLoadingConfig.path));
            }))
        ])
            .then(([plugins, services]) => {
                state.plugins = plugins;
                state.services = services;
                state.ready = true;
            })
            .then(() => buildApiTable(app))
            .then(() => {
                if (cluster.isMaster && program.multithread) {
                    const numCPUs = os.cpus().length;
                    for (var i = 0; i < numCPUs; i++) {
                        cluster.fork();
                    }
                } else {
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
                }
            }).catch((err) => {
                exitWithError(err, -1)
            })

    };
    if (require.main === module)
        app.start();
    app.loaded = true;
    app.emit('loaded');
});


function exitWithError(message, code = 0) {
    logger.error(message);
    process.exit(code);
}