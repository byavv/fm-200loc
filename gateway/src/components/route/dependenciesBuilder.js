const async = require('async')
    , debug = require("debug")("gateway");

module.exports = function (app, driverStore, cbk) {
    const DriverConfig = app.models.DriverConfig;
    const ApiConfig = app.models.ApiConfig;

    ApiConfig.find((err, apiConfigs) => {
        if (err) throw err;
        async.each(apiConfigs, (apiConfig, kk) => {
            async.each(apiConfig.plugins || [], (plugin, callback) => {
                async.forEachOf(plugin.dependencies || {}, (id, key, done) => {
                    DriverConfig.findById(id, (err, driverConfig) => {
                        if (err) throw err;
                        if (driverConfig) {
                            const driverSettings = driverConfig.settings;
                            const Driver = app.drivers.find((d) => d._name === driverConfig.driverId);
                            if (!driverStore.has(id)) {
                                driverStore.set(id, new Driver(app, driverSettings));
                            }
                        }
                        done();
                    })
                }, (err) => {
                    callback(err);
                })
            }, kk);
        }, cbk)
    })
}
