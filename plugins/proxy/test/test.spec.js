/*jslint node: true, mocha:true*/
"use strict";
const express = require('express'),
    http = require("http"),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    request = require('supertest'),
    ProxyPlugin = require('../'),
    Pipe = require('../../../gateway/src/components/route/pipe'),
    PluginBase = require('../../../gateway/src/components/route/pluginBase'),
    inherit = require("../../../lib/inherits")
    ;

describe('PROXY PLUGIN TESTS', function () {
    var app = express();
    var fakeServer = express();
    inherit(ProxyPlugin, PluginBase)
    var pipe = new Pipe();

    var httpServer;

    before((done) => {
        fakeServer.get('/api', function (req, res) {
            res.status(200).json({ name: 'potter' });
        });
        fakeServer.get('/fake2', function (req, res) {
            res.status(200).json({ name: 'tobi' });
        });
        fakeServer.get('/error', function (req, res) {
            res.sendStatus(500);
        });
        fakeServer.use((req, res, next) => {
            next()
        })
        fakeServer = fakeServer.listen(3234, done);
    })

    beforeEach((done) => {
        var plugin = new ProxyPlugin(0, pipe, []);
        pipe.insert({ target: 'http://localhost:3234', withPath: '/' }, 0);
        plugin.init();
        app.use(plugin.handler.bind(plugin));

        httpServer = http
            .createServer(app)
            .listen(3232, done);
    })
    afterEach(() => {
        httpServer.close();
        pipe.clean();
    })

    after(() => {
        fakeServer.close();
    });


    it('should return 404 if route not found', (done) => {
        request(app)
            .get('/fake1')
            .expect(404)
            .end(done);
    });

    it('should return 200 if route found', (done) => {
        request(app)
            .get('/api')
            .expect(200)
            .end(done);
    });

    it('should return 500 like target', (done) => {
        request(app)
            .get('/error')
            .expect(500)
            .end(done);
    });

    it('should throw if target does not set', (done) => {
        pipe.insert({ target: undefined, withPath: '/' }, 0);
        request(app)
            .get('/fake2')
            .expect(502)
            .end(done);
    });
});
