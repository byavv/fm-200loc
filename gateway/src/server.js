"use strtict"
const boot = require('loopback-boot')
    , http = require('http')
    , loopback = require('loopback')
    , gatewayFactory = require('./components/route');

const app = loopback();
const mongo_host = process.env.DBSOURCE_HOST || "localhost";
const etcd_host = process.env.ETCD_HOST || "localhost";
const logger = require('../../lib/logger');

app.set("mongo_host", mongo_host);
app.set("etcd_host", etcd_host);

app.start = (port) => {
    gatewayFactory(app);
    const httpServer = http
        .createServer(app)
        .listen(port, () => {
            app.emit('started');
            app.close = (cb) => {
                app.removeAllListeners('started');
                app.removeAllListeners('loaded');
                httpServer.close(cb);
            };
            logger.info(`Gateway started on port ${port}`);
        });
    return httpServer;
};

module.exports = {
    init: function init(plugins, drivers) {
        app.plugins = plugins;
        app.drivers = drivers;
        return new Promise((resolve, reject) => {
            boot(app, __dirname, (err) => {
                if (err) reject(err)
                if (require.main === module) {
                    app.start();
                }
                resolve(app)
            });
        });
    }
}
