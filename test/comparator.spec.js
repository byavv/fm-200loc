/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    comparator = require('../src/components/route/routeCompare');

describe('ROUTE ORDERING TESTS', () => {

    it('should order routes', () => {
        var fakeEntryConfigs = [
            { entry: '/' },
            { entry: '/super/route' },
            { entry: '/super/puper/route' },
            { entry: '/super' },
            { entry: '/super/puper/route/*' },
        ]
        fakeEntryConfigs.sort(comparator);       
        expect(fakeEntryConfigs.length).to.be.equal(5);
        expect(fakeEntryConfigs[0].entry).to.be.equal('/super/puper/route/*');
        expect(fakeEntryConfigs[1].entry).to.be.equal('/super/puper/route');
        expect(fakeEntryConfigs[2].entry).to.be.equal('/super/route');
        expect(fakeEntryConfigs[3].entry).to.be.equal('/super');
        expect(fakeEntryConfigs[4].entry).to.be.equal('/');
    })

    it('should order routes without separator', () => {
        var fakeEntryConfigs = [
            { entry: '' },
            { entry: 'super/route' },
            { entry: 'super/puper/route' }
        ]
        fakeEntryConfigs.sort(comparator);
        expect(fakeEntryConfigs.length).to.be.equal(3);
        expect(fakeEntryConfigs[0].entry).to.be.equal('super/puper/route');
    })
})
