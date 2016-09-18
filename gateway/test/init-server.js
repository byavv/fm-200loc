var fakeData = require('./fakeEntries');
var loader = require('../../lib/loader')();
var path = require('path');

module.exports = function (done) {
  loader
    .loadComponents(path.resolve(__dirname, './fakePlugins'))
    .then((plugins) => {
      const gateway = require('../src/server');
      gateway.init(plugins).then(app => {
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
