'use strict';

module.exports = function UnprocessableEntityError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = {
        statusCode: 422,
        massage: message
    };
    this.status = 422;
};

require('util').inherits(module.exports, Error);