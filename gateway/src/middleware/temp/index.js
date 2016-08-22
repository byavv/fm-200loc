/*jslint node: true */
"use strict";

module.exports = function (options) {
    return (req, res, next) => {
        console.log(req.accessToken);
        next();
    };
};