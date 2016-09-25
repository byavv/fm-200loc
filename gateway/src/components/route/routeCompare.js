/**
 * @module Route Component
 * @author Aksenchyk Viacheslav <https://github.com/byavv>
 * @description
 * Compare function for routes ordering by specificity
 **/
"use strict";
const path = require('path');
module.exports = function (routeA, routeB) {
    routeA = routeA.entry || '';
    routeB = routeB.entry || '';
    var slicedA = path.normalize('/' + routeA + '/').split('/');
    var slicedB = path.normalize('/' + routeB + '/').split('/');
    if (slicedA.length > slicedB.length) {
        return -1;
    }
    if (slicedA.length < slicedB.length) {
        return 1;
    }
    return 0;
}
