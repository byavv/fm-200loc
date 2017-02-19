const seedData = require('./fakeEntries');
const loader = require('../lib/loader')();
const path = require('path');
const state = require('../src/state');
const fs = require('fs');
const buildApiTable = require('../src/components/route')

const app = require('../src/server');
module.exports = function (done) {
  const configPath = path.resolve(__dirname, 'testConfig.json');
  if (!fs.existsSync(configPath)) {
    throw 'No configuration file found';
  };
  let config = require(configPath);
  if ((!config.services || !Array.isArray(config.services))) {
    throw new Error('Configuration has wrong format')
  }
  if ((!config.plugins || !Array.isArray(config.plugins))) {
    throw new Error('Configuration has wrong format');
  }
  let services = config.services;
  let plugins = config.plugins;

  Promise.all([
    Promise.all(plugins.map((pluginLoadingConfig) => {
      return loader.loadComponentFromPath(path.resolve(__dirname, pluginLoadingConfig.path));
    })),
    Promise.all(services.map((serviceLoadingConfig) => {
      return loader.loadComponentFromPath(path.resolve(__dirname, serviceLoadingConfig.path));
    }))
  ])
    .then(([plugins, services]) => {
      state.plugins = plugins;
      state.services = services;
      state.ready = true;     
    })
    .then(() => seedData(app))
    .then(() => buildApiTable(app))
    .then(() => {     
      app.close = function (clb) {
        state.servicesStore.clear();
        server.close(clb);
      }
      const server = app.listen(3009, () => {
        done(null, app)
      });
    }, (err) => {

    }).catch(err => {
      console.error(err)

      done(err)
    });
};
