/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    request = require('supertest'),
    state = require('../src/state')
    ;

describe('GATEWAY TESTS', () => {
    var app, ApiConfig;

    before((done) => {
        require('./init-server')((err, a) => {
            if (err) return done(err)
            app = a;
            ApiConfig = app.models.ApiConfig;
            done();
        });
    });

    after((done) => {
        if (ApiConfig)
            ApiConfig.destroyAll(() => {
                app.close(done);
            });
    });

    it('should load plugins', () => {
        expect(state.plugins.length).to.be.equal(6);
    });

    it('should ignore entry if one of plugins is not defined', (done) => {
        request(app)
            .get('/pluginnotexists')
            .set('Accept', 'application/json')
            .expect(404)
            .end(done);
    });

    it("should return 'not found' when wrong url", (done) => {
        request(app)
            .get('/no_route/like_this')
            .expect(404)
            .end(done);
    });

    it('should return error when plugin returns fail', (done) => {
        request(app)
            .get('/test')
            .set('Accept', 'application/json')
            .expect(404)
            .end((err, res) => {
                done()
            });
    });

    it('should pipe plugin req', (done) => {
        request(app)
            .get('/test2')
            .set('Accept', 'application/json')
            .expect(500)
            .end(done);
    });

    it('should pass if plugin does not call next callback', (done) => {
        request(app)
            .get('/testnotreturn')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, {
                respond: 'ok'
            })
            .end(done);
    });



    it('should return default strongloop 404 when plugin passes request', (done) => {
        request(app)
            .get('/test3')
            .expect(404)
            .end(done);
    });

    it('should use dynamic parameters', (done) => {
        request(app)
            .get('/test4')
            .expect(200, {
                respond: 'harry potter'
            })
            .end((err, res)=>{
                done(err)
            });
    });

    it('should use environment variable', (done) => {
        process.env.SOME_HOST = 'tobi'
        request(app)
            .get('/test5')
            .expect(200, {
                respond: 'tobi'
            })
            .end(done);
    });

    it('should use default plugin when no exist', (done) => {

        request(app)
            .get('/pluginnotexists')
            .end((err) => {
                console.log(err);
                done(err)
            });
    });    
});
