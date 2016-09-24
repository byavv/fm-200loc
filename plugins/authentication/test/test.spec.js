/*jslint node: true, mocha:true*/
"use strict";
const express = require('express'),
    http = require("http"),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    request = require('supertest'),
    Pipe = require('../../../gateway/src/components/route/pipe'),
    PluginBase = require('../../../gateway/src/components/route/pluginBase'),
    inherit = require("../../../lib/inherits")
    ;

describe('AUTHENTICATION PLUGIN TESTS', function () {

    var httpServer, pipe;
    const app = express();   
    let AuthPlugin = require("../");
    inherit(AuthPlugin, PluginBase)
    var accessToken = {
        userId: "1"
    }

    var RoleMock = {
      //  find: sinon.stub().yields(null, [{ name: 'user' }, { name: 'admin' }]),
      //  isInRole: sinon.stub().yields(null, true)
         find: sinon.stub(),//.yields(null, [{ name: 'user' }, { name: 'admin' }]),
        isInRole: sinon.stub()//.yields(null, true)
    }
    before(() => {
        app.models = { role: RoleMock, ACL: { USER: 1 } };
    })
     pipe = new Pipe();
    beforeEach((done) => {       
        var plugin = new AuthPlugin(0, pipe, []);

        app.use((req, res, next) => {
            req.app = app;
            req.accessToken = accessToken;
            next()
        });
        app.use(plugin.handler.bind(plugin));

        app.get('/api', function (req, res) {
            res.status(200).json({ all: 'green' });
        });
        httpServer = http
            .createServer(app)
            .listen(3232, done);
    })

    afterEach(function () {
        httpServer.close();
        pipe.clean()
    });

    it('should ignore authentication', (done) => {
        pipe.insert({ grant: '*' }, 0)
        request(app)
            .get('/api')
            .expect(200)
            .end(done);
    });

    it('authentication should pass', (done) => {
        RoleMock.find.yields(null, [{ name: 'user' }, { name: 'admin' }])
        RoleMock.isInRole.yields(null, true);
        pipe.insert({ grant: 'read' }, 0);
        request(app)
            .get('/api')
            .expect(200)
            .end((err, res) => {
                done(err)
            });
    });

    it('authentication should not pass when user is not in role', (done) => {
        pipe.insert({ grant: 'read' }, 0);
        accessToken = {
            userId: 2
        };
        RoleMock.isInRole.yields(null, false)
        request(app)
            .get('/api')
            .expect(401)
            .end(done);
    });

    it('authentication should not pass when role for permission is not found', (done) => {
        pipe.insert({ grant: 'read' }, 0);
        RoleMock.find.yields(null, [])
        request(app)
            .get('/api')
            .expect(401)
            .end(done);
    });

    it('authentication should not pass when user is not authorized', (done) => {
        pipe.insert({ grant: 'read' }, 0);
        accessToken = undefined;
        request(app)
            .get('/api')
            .expect(401)
            .end(done);
    });

    it('authentication should not throw when database error', (done) => {
        pipe.insert({ grant: 'read' }, 0);
        accessToken = { userId: 1 };
        RoleMock.find.yields(new Error(), null)
        request(app)
            .get('/api')
            .expect(500)
            .end(done);
    });
});
