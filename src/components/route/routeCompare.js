"use strict";
const path = require('path');
/**
 * @function compare
 * @desctiption express route compare function to sort enties by specifity
 */
module.exports = function compare(routeA, routeB) {
    routeA = routeA.entry || '';
    routeB = routeB.entry || '';
    var slicedA = routeA.split('/').filter(v => v);
    var slicedB = routeB.split('/').filter(v => v);  
    if (slicedA.length > slicedB.length) {
        return -1;
    }
    if (slicedA.length < slicedB.length) {
        return 1;
    }
    return 0;
}
