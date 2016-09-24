/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    Pipe = require('../src/components/route/pipe');

describe('PIPE TESTS', () => {

    describe('ROUTE PIPE OBJECT TESTS', () => {
        let pipe;
        beforeEach(() => {
            pipe = new Pipe();
            pipe.insert({
                some: 'value'
            }, 0);
        })

        it('data should be inserted', () => {
            expect(pipe._get("some", 0)).to.be.equal("value");
        });
        it('should set data by key', () => {
            pipe.insert({
                another: '${param1}'
            }, 1);
            pipe._set("param1", "value2");
            expect(pipe._get("another", 1)).to.be.equal("value2");
        });
        it('should rewright data by key', () => {
            pipe.insert({
                another: '${param2}'
            }, 1);
            pipe._set("param2", "value3");
            expect(pipe._get("another", 1)).to.be.equal("value3");
            pipe._set("param2", "value4");
            expect(pipe._get("another", 1)).to.be.equal("value4");
        });
    })

    describe('PIPE BUILD PROCESS TESTS', () => {
        let pipe, config1 = {
            some: 'value'
        }, config2 = {
            some2: 'value2'
        }, config3 = {
            some3: 'value3'
        };
        beforeEach(() => {
            pipe = new Pipe();
            pipe.insert(config1, 0);
            pipe.insert(config2, 1);
            pipe.insert(config3, 2);
        })

        it('should build pipe from plugins declaration', () => {
            expect(pipe._storage.size).to.be.equal(3);
        });

        it('should contain prefixed keys-value pairs', () => {
            expect([...pipe._storage.keys()])
                .to.deep.equal(['plugin_:0', 'plugin_:1', 'plugin_:2'])
            expect([...pipe._storage.values()])
                .to.deep.equal([config1, config2, config3]);
        });
    })
})