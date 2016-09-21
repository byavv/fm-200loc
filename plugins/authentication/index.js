'use strict';
/*jslint node: true */
const debug = require('debug')('plugins:authentication'),
    async = require('async'),
    logger = require('../../lib/logger');

module.exports = (function () {

    let cls = function () {
        this.constructor.super.call(this, arguments);
        this.init = function () {
            return new Promise((resolve, reject) => {
                resolve();
            })
        }
        this.handler = function (req, res, next) {
            const grant = this.getParam('grant');
            if (grant === '*') {
                return next(null);
            } else {
                if (!!req.accessToken) {
                    const Role = req.app.models.role;
                    const ACL = req.app.models.ACL;
                    const permissions = grant.split(/\s*,\s*/);
                    debug(`Required permissions for route: ${req.originalUrl}: [${permissions}]`);
                    Role.find({
                        where: { can: { inq: permissions } },
                        fields: { 'name': true, 'id': false }
                    }, (err, roles) => {
                        if (err) throw err;
                        if (!roles || roles.length === 0) {
                            return res.status(401).send("Permission can't be granted");
                        }
                        async.some(roles, (role, callback) => {
                            Role.isInRole(role.name, {
                                principalType: ACL.USER,
                                principalId: req.accessToken.userId
                            }, callback);
                        }, (err, result) => {
                            if (err) throw err;
                            // propogate for inner usage
                            req.headers["X-PRINCIPLE"] = req.accessToken.userId;
                            // user is not in any appropriate role, which contains required permisison
                            return !result ? res.status(401).send("User authorized, but doesn't have required permission. Verify that sufficient permissions have been granted") : next();
                        });
                    });
                } else {
                    debug(`Authorization failed for ${req.method} request on ${req.originalUrl}, access token is not defined`);
                    return res.status(401).send(`Not authorized`);
                }
            }
        }
    };

    cls._name = 'authentication';
    cls._description = 'Loopback-based authentication middleware';
    return cls;
})();
