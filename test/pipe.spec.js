/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    pipeFactory = require('../src/components/route/pipe');

describe('PIPE TESTS', () => {

    describe('ROUTE PIPE OBJECT TESTS', () => {
        let pipe;
        beforeEach(() => {
            pipe = pipeFactory();
            pipe.insert({
                some: 'value'
            }, 0);
        })

        it('data should be inserted', () => {
            expect(pipe.getItem("some", 0)).to.be.equal("value");
        });
        it('should set data by key', () => {
            pipe.insert({
                another: '${param1}'
            }, 1);
            pipe.setItem("param1", "value2");
            expect(pipe.getItem("another", 1)).to.be.equal("value2");
        });
        it('should rewright data by key', () => {
            pipe.insert({
                another: '${param2}'
            }, 1);
            pipe.setItem("param2", "value3");
            expect(pipe.getItem("another", 1)).to.be.equal("value3");
            pipe.setItem("param2", "value4");
            expect(pipe.getItem("another", 1)).to.be.equal("value4");
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
            pipe = pipeFactory();
            pipe.insert(config1, 0);
            pipe.insert(config2, 1);
            pipe.insert(config3, 2);
        })

        it('should build pipe from plugins declaration', () => {
            expect(pipe._map.size).to.be.equal(3);
        });

        it('should contain prefixed keys-value pairs', () => {
            expect([...pipe._map.keys()])
                .to.deep.equal(['plugin_:0', 'plugin_:1', 'plugin_:2'])
            expect([...pipe._map.values()])
                .to.deep.equal([config1, config2, config3]);
        });
    })
})