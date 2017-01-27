'use strict';

module.exports = function GateWayError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 502;
    this.code = 'GATEWAY_INTERNAL_ERROR';
    this.source = source;
};

require('util').inherits(module.exports, Error);
