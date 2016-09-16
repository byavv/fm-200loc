/*jslint node: true */
'use strict';
const path = require("path")
    , loopback = require('loopback');

module.exports = function (app) {
   /* app.use('/static', loopback.static(path.join(__dirname, '../../build')));
    app.use('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../build/index.html'));
    });*/
    console.log('static')
}