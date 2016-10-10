/*jslint node: true, mocha:true*/
"use strict";
const express = require('express'),
    http = require("http"),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    request = require('supertest'),   
    Pipe = require('../../../src/components/route/pipe'),
    Context = require('../../../src/components/route/context')
    ;

describe('DISCOVERY PLUGIN TESTS', function () {
    let DiscoveryPlugin = require("../");

    var httpServer, pipe;
    describe('Discovery all ok', () => {
        const app = express();
        pipe = new Pipe();
        beforeEach((done) => {
            let ctx = new Context(0, pipe, {
                'etcd': {
                    findServiceByKey: function (param, clb) {
                        expect(param).to.equal('test');
                        clb(null, { url: 'localhost' })
                    }
                }
            });
            var plugin = new DiscoveryPlugin(ctx);

            app.use(plugin.handler.bind(plugin));
            app.get('/api', function (req, res) {
                res.status(200).json({ all: 'green' });
            });
            httpServer = http
                .createServer(app)
                .listen(3232, done);
        })
        afterEach(() => {
            pipe.clean();
            httpServer.close();
        })

        it('should throw 501 if mapTo isnt set', (done) => {
            pipe.insert({ mapTo: undefined }, 0);
            request(app)
                .get('/api')
                .expect(501)
                .end(done);
        });

        it('should set localhost to pipe variable', (done) => {
            pipe.insert({ mapTo: 'test' }, 0);
            request(app)
                .get('/api')
                .expect(200)
                .end((err, res) => {
                    console.log(err)
                    done(err)
                });
        });

    });

    describe('Discovery broken', () => {
        const app = express();
        before((done) => {
            pipe = new Pipe();
            let ctx = new Context(0, pipe, {
                'etcd': {
                    findServiceByKey: function (param, clb) {
                        expect(param).to.equal('test');
                        clb(null, null)
                    }
                }
            });
            var plugin = new DiscoveryPlugin(ctx);
            app.use(plugin.handler.bind(plugin));
            app.get('/api', function (req, res) {
                res.status(200).json({ all: 'green' });
            });
            httpServer = http
                .createServer(app)
                .listen(3232, done);

        });

        after(function () {
            httpServer.close();
            pipe.clean();
        });

        it('should throw when service is not found', (done) => {
            pipe.insert({ mapTo: 'test' }, 0);
            request(app)
                .get('/api')
                .expect(404)
                .end(done);
        });
    });
    describe('Discovery error', () => {
        const app = express();
        pipe = new Pipe();

        before((done) => {
            pipe.insert({ mapTo: 'test' }, 0);
            let ctx = new Context(0, pipe, {
                'etcd': {
                    findServiceByKey: function (param, clb) {
                        expect(param).to.equal('test');
                        clb(new Error('some error'), null);
                    }
                }
            });
            var plugin = new DiscoveryPlugin(ctx);
            app.use(plugin.handler.bind(plugin));
            app.get('/api', function (req, res) {
                res.status(200).json({ all: 'green' });
            });
            httpServer = http
                .createServer(app)
                .listen(3232, done);

        });
        after(function () {
            httpServer.close();
        });

        it('should throw when service discovery error', (done) => {
            request(app)
                .get('/api')
                .expect(502)
                .end(done);
        });
    })
});
