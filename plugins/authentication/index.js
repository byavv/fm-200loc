'use strict';
/*jslint node: true */
const debug = require('debug')('plugins:authentication');

module.exports = (function () {

    let cls = function (app, settings) {
        let _settings = settings;
        this.app = app;
        this.getSettings = function (key) {
            return _settings[key];
        }
    };
   
    cls.prototype.init = function () {
         return new Promise((resolve, reject) => {          
            resolve();
        })
    }
    cls.prototype.handler = function (req, res, next) {
        if (this.getSettings('grant') === '*') {
            return next(null);
        } else {
            if (!!req.accessToken && Array.isArray(this.getSettings('grant'))) {
                let Role = req.app.models.role;
                let ACL = req.app.models.ACL;
                Role.find({
                    where: { can: { inq: this.getSettings('grant') } },
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
                        // user is not in any appropriate role, which contains required permisison
                        return !result ? res.status(401).send("User authorized, but doesn't have required permission. Verify that sufficient permissions have been granted") : next();
                    });
                });
            } else {
                let url = URL.parse(req.url);
                debug(`Authorization failed for ${req.method} request on ${url.path}`);
                return res.status(401).send(`Not authorized`);
            }
        }
    }

    cls._name = 'authentication';
    cls._description = 'Loopback-based authentication middleware';
    return cls;
})()

