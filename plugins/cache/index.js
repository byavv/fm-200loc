/*jslint node: true */
"use strict";
const debug = require('debug')('plugins:cache'),
    errors = require('../../lib/errors'),
    logger = require('../../lib/logger')
    ;

module.exports = (function () {
    let cls = function (ctx) {
        let memcacheInst = ctx('$inject:cache');
        let forCaching = ctx('$get:forCaching');
        let ttl = 60;
        let HEADER_KEY = 'Cache-Control'
        let NO_CACHE_KEY = 'no-cache'
        let MAX_AGE_KEY = 'max-age'
        let MUST_REVALIDATE_KEY = 'must-revalidate';
        let cacheHeader = 'X-Cacher-Hit'

        function appendCache(res, data) {
            if (!data) return
            var buf = data
            if (typeof data === "string") {
                buf = new Buffer(data)
            }
            if (res._responseBody) {
                res._responseBody = Buffer.concat([res._responseBody, buf])
            } else {
                res._responseBody = buf
            }
        }

        function setHeaders(res, ttl) {
            res.header(HEADER_KEY, MAX_AGE_KEY + "=" + ttl + ", " + MUST_REVALIDATE_KEY)
        }
        function sendCached(res, cacheObject) {
            res.statusCode = cacheObject.statusCode
            for (var header in cacheObject.headers) {
                res.header(header, cacheObject.headers[header])
            }
            res.header(cacheHeader, true);
            res.end(new Buffer(cacheObject.content, "base64"));
        }

        function genCacheKey(req) {
            return req.originalUrl;
        }

        function buildEnd(res, key, staleKey, realTtl, ttl) {
            var origEnd = res.end;
            var origWrite = res.write;
            res.end = function (data) {
                appendCache(res, data)
                var cacheObject = { statusCode: res.statusCode, content: res._responseBody ? res._responseBody.toString("base64") : '', headers: res._headers }
                if (ttl > 0) {
                    memcacheInst.set(key, cacheObject, realTtl, function (err) {
                        if (err) {
                            logger.warn('Caching error')
                        }
                    })
                }
                return origEnd.apply(res, arguments);
            }
        }

        function buildWrite(res) {
            var origWrite = res.write
            res.write = function (data) {
                appendCache(res, data)
                return origWrite.apply(res, arguments)
            }
        }

        this.handler = function (req, res, next) {

            let cachingKey = forCaching.split(":")[1];
            var key = genCacheKey(req);

            if (cachingKey != key) {
                return next();
            }

            var staleKey = key + ".loc";
            var realTtl = 60;
            memcacheInst.get(key, function (err, cacheObject) {
                if (err) {
                    return next();
                }
                setHeaders(res, ttl)
                if (cacheObject) {
                    return sendCached(res, cacheObject)
                }

                buildEnd(res, key, staleKey, realTtl, ttl)
                buildWrite(res)
                res.header(cacheHeader, false)
                next();
            });
        }
    };
    return cls;
}());
