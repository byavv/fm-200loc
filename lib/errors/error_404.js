'use strict';

module.exports = function NotFoundError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
    this.source = source;
};

require('util').inherits(module.exports, Error);
