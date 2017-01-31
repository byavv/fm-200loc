/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    request = require('supertest'),
    pipeBuilder = require('../src/components/route/pipeBuilder'),
    Pipe = require('../src/components/route/pipe');


describe('PIPE BUILDER TESTS', () => {
    var app, global;
    let ApiConfig;

    before((done) => {
        require('./init-server')((err, a) => {
            if (err) return done(err)
            app = a;
            ApiConfig = app.models.ApiConfig;
            global = require('../src/global');
            done();
        });
    });

    process.on('unhandledRejection', (reason) => {
        // console.error(reason);
        // process.exit(1);
        // see; https://github.com/strongloop/loopback/issues/2512
    });

    after((done) => {
        ApiConfig.destroyAll(() => {
            app.close(done);
        });
    });

    it('should init services, plugins and build global object', () => {
        expect(global.services.length).to.be.equal(1);
        expect(global.plugins.length).to.be.equal(6);
    });

    it('should inject dependencies', (done) => {
        request(app)
            .get('/test6')
            .expect(200, {
                respond: 'testString'
            })
            .end(done);
    });

    it('should ignore entry with wrong dependencies', (done) => {
        request(app)
            .get('/test7')
            .expect(404)
            .end(done);
    });

    it('should set error to config object after trying toi create pipe with dependencies error ', (done) => {
        request(app)
            .get('/test7')
            .expect(404)
            .end(() => {
                ApiConfig.findOne({ where: { name: 'route7' } }, (err, inst) => {
                    expect(inst.error).to.not.be.null;
                    expect(inst.active).to.be.false;
                    done();
                });
            });
    });

    it('should check if required for pipe plugins have dependencies errors', () => {


    });
})

