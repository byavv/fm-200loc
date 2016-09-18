const async = require('async')
    , debug = require("debug")("gateway")
    , global = require('../../global');

module.exports = function (app) {
    const DriverConfig = app.models.DriverConfig;
    return new Promise((resolve, reject) => {
        DriverConfig.find({/* todo: where: {active: true} */ }, (err, driverConfigs) => {
            try {
                if (err) throw err;
                (driverConfigs || []).forEach((driverConfig) => {
                    const driverSettings = driverConfig.settings;
                    const Driver = global.drivers.find((d) => d._name === driverConfig.driverId);
                    if (!Driver) throw new Error(`Driver ${driverConfig.driverId} is not defined`)
                    if (!global.driversStore.has(driverConfig.id)) {
                        debug(`Instansiate plugin: ${driverConfig.driverId}`);
                        global.driversStore.set(driverConfig.id.toString(), new Driver(app, driverSettings));
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    })
}
