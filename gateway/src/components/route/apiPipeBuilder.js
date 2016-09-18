
/**
 * Builds plugins pipe for route
 */
module.exports = function (app, plugins, dataStore, callback) {

    plugins.forEach((plugin) => {
        const settings = Object.assign({}, plugin.settings);
        const dependencies = Object.assign({}, plugin.dependencies);
       

        // find all dynamic parameters and provide getting values from global pipe object or environment
        Object.keys(settings).forEach((paramKey) => {
            const matchDyn = settings[paramKey] && _.isString(settings[paramKey])
                ? settings[paramKey].match(DYNAMIC_CONFIG_PARAM)
                : false;
            const matchEnv = settings[paramKey] && _.isString(settings[paramKey])
                ? settings[paramKey].match(ENV_CONFIG_PARAM)
                : false;
            if (matchDyn) {
                Object.defineProperty(settings, paramKey, {
                    get: function () {
                        return pipe.get(matchDyn[1]);
                    }
                });
            }
            if (matchEnv) {
                Object.defineProperty(settings, paramKey, {
                    get: function () {
                        return process.env[matchEnv[1]];
                    }
                });
            }
        });

        let Plugin = app.plugins.find((p) => p._name === plugin.name);
        if (!Plugin) {
            pluginsArray.push(require('./defaultPlugin')(plugin.name));
        } else {
            let plugin = new Plugin(app, settings, pipe);
            pluginsArray.push(plugin);
        }
    })
}