'use strict';

module.exports = function BadRequestError(message, source = 'core') {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = 400;
    this.code = 'BAD_REQUEST';   
    this.source = source;
};

require('util').inherits(module.exports, Error);
