'use strict';

module.exports = function InternalServerError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 501;
    this.code = 'NOT_IMPLEMENTED';
    this.source = source;
};

require('util').inherits(module.exports, Error);
