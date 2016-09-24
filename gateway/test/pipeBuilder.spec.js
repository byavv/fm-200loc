/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    request = require('supertest'),
    Pipe = require('../src/components/route/pipe');


describe('PIPE BUILDER TESTS', () => {
    let app, global;
    before((done) => {
        require('./init-server')((a) => {
            app = a;
            global = require('../src/global')
            done();
        })
    });

    beforeEach(() => {

    })

    it('should init drivers, plugins and build global object', () => {
        expect(global.drivers.length).to.be.equal(1);
        expect(global.plugins.length).to.be.equal(5);
    });

    it('should inject dependencies', (done) => {

        request(app)
            .get('/test6')
            .expect(200, {
                respond: 'testString'
            })
            .end(done);

    });
})

