'use strict';

module.exports = function BadRequestError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = {
        statusCode: 400,
        massage: message
    };
    this.status = 400;
};

require('util').inherits(module.exports, Error);
