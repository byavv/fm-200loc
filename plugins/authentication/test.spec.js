/*jslint node: true, mocha:true*/
"use strict";
const loopback = require('loopback'),
    http = require("http"),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    request = require('supertest'),
    Pipe = require('../../gateway/src/components/route/pipe')
    ;

describe('AUTHENTICATION PLUGIN TESTS', function () {

    var httpServer;
    const app = loopback();
    const params = { grant: '*' };
    let AuthPlugin = require("./");
    var accessToken = {
        userId: "1"
    }

    var RoleMock = {
        find: sinon.stub().yields(null, [{ name: 'user' }, { name: 'admin' }]),
        isInRole: sinon.stub().yields(null, true)
    }

    beforeEach((done) => {
        app.models = { role: RoleMock, ACL: { USER: 1 } };
        var plugin = new AuthPlugin(app, params, new Pipe());
        plugin.init();
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
    });

    it('should ignore authentication', (done) => {
        params.grant = "*";
        request(app)
            .get('/api')
            .expect(200)
            .end(done);
    });

    it('authentication should pass', (done) => {
        params.grant = 'read';
        request(app)
            .get('/api')
            .expect(200)
            .end((err, res) => {
                done(err)
            });
    });

    it('authentication should not pass when user is not in role', (done) => {
        params.grant = 'read';
        accessToken = {
            userId: 2
        };
        RoleMock.isInRole = sinon.stub().yields(null, false)
        request(app)
            .get('/api')
            .expect(401)
            .end(done);
    });

    it('authentication should not pass when role for permission is not found', (done) => {
        params.grant = 'read';
        RoleMock.find = sinon.stub().yields(null, [])
        request(app)
            .get('/api')
            .expect(401)
            .end(done);
    });

    it('authentication should not pass when user is not authorized', (done) => {
        params.grant = 'read';
        accessToken = undefined;
        request(app)
            .get('/api')
            .expect(401)
            .end(done);
    });

    it('authentication should not throw when database error', (done) => {
        params.grant = 'read';
        accessToken = { userId: 1 };
        RoleMock.find = sinon.stub().yields(new Error(), null)
        request(app)
            .get('/api')
            .expect(500)
            .end(done);
    });
});
