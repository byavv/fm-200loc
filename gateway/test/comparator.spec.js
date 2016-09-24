/*jslint node: true, mocha:true*/
"use strict";
const chai = require('chai'),
    expect = chai.expect,
    comparator = require('../src/components/route/routeCompare');

describe('ROUTE ORDERING TESTS', () => {

    it('should order routes', () => {
        var routesUnsorted = [
            { entry: '/' },
            { entry: '/super/route' },
            { entry: '/super/puper/route' },
            { entry: '/super' }
        ]
        routesUnsorted.sort((a, b) => comparator(a, b));
        expect(routesUnsorted.length).to.be.equal(4);
        expect(routesUnsorted[0].entry).to.be.equal('/super/puper/route');
        expect(routesUnsorted[1].entry).to.be.equal('/super/route');
        expect(routesUnsorted[2].entry).to.be.equal('/super');
        expect(routesUnsorted[3].entry).to.be.equal('/');
    })

    it('should order routes without separator', () => {
        var routesUnsorted = [
            { entry: '' },
            { entry: 'super/route' },
            { entry: 'super/puper/route' }
        ]
        routesUnsorted.sort((a, b) => comparator(a, b));
        expect(routesUnsorted.length).to.be.equal(3);
        expect(routesUnsorted[0].entry).to.be.equal('super/puper/route');
    })
})
