var fakeData = require('./fakeEntries');
var loader = require('../../lib/loader')();
var path = require('path');

module.exports = function (done) {
  //loader
  //  .loadComponents(path.resolve(__dirname, './fakePlugins'))
  Promise.all([
    loader
      .loadComponents(path.resolve(__dirname, './fakePlugins')),
    loader
      .loadComponents(path.resolve(__dirname, './fakeDrivers'))
  ])
    .then((components) => {      
      const gateway = require('../src/server');
      gateway.init(...components).then(app => {
        fakeData(app, () => {
          app.start(3009);
        })
        app.once('started', () => {
          done(app)
        });
      })
    }).catch(err => {
      done(err)
    });
};
