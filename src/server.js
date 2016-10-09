"use strtict"
const boot = require('loopback-boot')
    , http = require('http')
    , loopback = require('loopback')
    , minimist = require('minimist')
    , buildGatewayTable = require('./components/route')
    , debug = require('debug')('gateway')
    , redis = require('redis')
    , path = require('path')
    , _ = require('lodash')
    ;

const app = module.exports = loopback();

const mongo_host = process.env.MONGO_HOST || "localhost";
const redis_host = process.env.REDIS_HOST || "localhost";
const etcd_host = process.env.ETCD_HOST || "localhost";

const node_name = process.env.NODE_NAME || `node-${Math.random().toString(36).substring(2, 7)}`;
const logger = require('../lib/logger');
const loader = require('../lib/loader')();
const global = require('./global');

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


/**

program
  .version('1.21.0')
  .option('-p, --port <port>', 'Select Port', /^\d+$/i, 3000)
  .option('-t, --tunnel', 'Use nat-pmp to configure port fowarding')
  .option('-g, --gateip <gateip>', 'Manually set gateway IP for the tunnel option')
  .option('-l, --login', 'Require users to login')
  .option('-u, --user <user>', 'Set Username')
  .option('-x, --password <password>', 'Set Password')
  .option('-G, --guest <guestname>', 'Set Guest Username')
  .option('-X, --guestpassword <guestpassword>', 'Set Guest Password')
  // .option('-k, --key <key>', 'Add SSL Key')
  // .option('-c, --cert <cert>', 'Add SSL Certificate')
  .option('-d, --database <path>', 'Specify Database Filepath', 'mstreamdb.lite')
  .option('-b, --beetspath <folder>', 'Specify Folder where Beets DB should import music from.  This also overides the normal DB functions with functions that integrate with beets DB')
  .option('-i, --userinterface <folder>', 'Specify folder name that will be served as the UI', 'public')
  .option('-f, --filepath <folder>', 'Set the path of your music directory', process.cwd())
  .parse(process.argv);

 */


app.set("mongo_host", mongo_host);
app.set("redis_host", redis_host);
app.set("etcd_host", etcd_host);
app.set("node_name", node_name);

const http_port = process.env.HTTP_PORT || 3001;

const sub = redis.createClient({
    host: app.get('redis_host'),
    port: 6379
});
sub.on("message", function (channel, message) {
    message = JSON.parse(message);
    if (message.action == 'update') {
        global.ready = false;
        buildGatewayTable(app)
            .then(() => {
                global.ready = true;
                debug(`Node ${app.get('node_name')} configuration updated`);
            });
    }
});
sub.subscribe("cluster");

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
            .then(([plugins, drivers]) => {
                global.plugins = plugins;
                global.drivers = drivers;
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
                throw err;
            });
    };

    if (require.main === module)
        app.start();
    app.loaded = true;
    app.emit('loaded');
});
