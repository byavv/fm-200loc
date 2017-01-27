'use strict';

module.exports = function GateWayError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = {
        statusCode: 502,
        massage: message
    };
    this.status = 502;
};

require('util').inherits(module.exports, Error);
