'use strict';

module.exports = function UnauthorizedAccessError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 401;
    this.code = 'UNAUTHORIZED';
    this.source = source;
};

require('util').inherits(module.exports, Error);
