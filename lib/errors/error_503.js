'use strict';

module.exports = function GateWayError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 503;
    this.code = 'SERVICE_UNAVAILABLE';
    this.source = source;
};

require('util').inherits(module.exports, Error);