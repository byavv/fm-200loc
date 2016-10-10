const seedData = require('./fakeEntries');
const loader = require('../lib/loader')();
const path = require('path');
const global = require('../src/global');
const buildGatewayTable = require('../src/components/route')

const app = require('../src/server');
module.exports = function (done) {
  Promise.all([
    loader
      .loadComponents(path.resolve(__dirname, './fakePlugins')),
    loader
      .loadComponents(path.resolve(__dirname, './fakeDrivers'))
  ])
    .then(([plugins, drivers]) => {
      global.plugins = plugins;
      global.drivers = drivers;
      global.ready = true;
    })
    .then(() => seedData(app))
    .then(() => buildGatewayTable(app))
    .then(() => {
      /*  app.once('started', () => {
          done(app)
        });*/
      const server = app.listen(3009, () => {
        done(null, server)
      });
    }).catch(err => {
      done(err)
    });
};
