/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    Pipe = require('../src/components/route/pipe');

describe('ROUTE PIPE OBJECT TESTS', () => {
    let pipe;
    beforeEach(() => {
        pipe = new Pipe({ some: "value" });
    })

    it('should set default data', () => {
        expect(pipe.get("some")).to.be.equal("value");
    })
    it('should set data by key', () => {
        pipe.set("another", "value2")
        expect(pipe.get("another")).to.be.equal("value2");
    })
    it('should rewright data by key', () => {
        pipe.set("some", "value3")
        expect(pipe.get("some")).to.be.equal("value3");
    })
    it('should clean data by key', () => {
        pipe.set("some", "value3")
        expect(pipe.get("some")).to.be.equal("value3");
        pipe.clean("some");
        expect(pipe.get("some")).to.be.undefined;
    })
    it('should clean pipe', () => {
        pipe.set("some2", "value2")
        pipe.set("some3", "value3")
        pipe.set("some4", "value4")
        expect(pipe.get("some2")).to.be.equal("value2");
        pipe.clean();
        expect(pipe.get("some2")).to.be.undefined;
        expect(pipe.get("some3")).to.be.undefined;
        expect(pipe.get("some4")).to.be.undefined;
    })
})
