'use strict';

module.exports = function UnprocessableEntityError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 422;
    this.code = 'UNPROCESSABLE_ENTITY';
    this.source = source;
};

require('util').inherits(module.exports, Error);
