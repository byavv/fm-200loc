"use strtict"
const boot = require('loopback-boot')
    , http = require('http')
    , path = require('path')
    , loopback = require('loopback');

const app = loopback();
const logger = require('../../lib/logger');

const mongo_host = process.env.DBSOURCE_HOST || '127.0.0.1';

app.set("mongo_host", mongo_host);
app.start = function (port) {
 
   // app.all('*', (req, res) => {
   //     res.sendFile(path.join(__dirname, '../build/index.html'));
  //  });
    return app.listen(port, () => {
        app.emit('started');
        app.close = (cb) => {
            app.removeAllListeners('started');
            app.removeAllListeners('loaded');
            httpServer.close(cb);
        };
        logger.info(`Api explorer started on port ${port}`)
    });
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
                resolve(app);
            });
        });
    }
}
