'use strict';
/*jslint node: true */
const debug = require('debug')('plugins:authentication'),
    async = require('async')
    , errors = require('../../lib/errors')
    , logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (ctx) {  
                   
        this.handler = function (req, res, next) {
            const grant = ctx.$param['grant'];
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
                            return next(new errors.err401("Permission can't be granted"));
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
                            return !result
                                ? next(new errors.err401("User authorized, but doesn't have required permission. Verify that sufficient permissions have been granted"))
                                : next();
                        });
                    });
                } else {
                    debug(`Authorization failed for ${req.method} request on ${req.originalUrl}, access token is not defined`);
                    return next(new errors.err401(`Not authorized`));
                }
            }
        }
    };

    cls._name = 'authentication';
    cls._description = 'Loopback-based authentication middleware';
    return cls;
})();
