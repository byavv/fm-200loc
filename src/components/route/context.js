/**
 * @module Plugin context
 */
/** 
 * @typedef Context
 * @type {Function}
 * 
 */
"use strict";
/**
 * Creates a new context object to be injected to required plugin.
 * @function contextFactory
 * @returns {Context}
 */
function contextFactory(id, pipe, deps) {

    /**
     * Default operation if not defined to throw an error
     * @function contextOperation
     * @description Returns funtion for access to injected dependencies and pipe parameters
     * @example
     * const myRequiredParam = ctx("$get:myParamKey")
     * ctx("$get:myParamKey", myValue)
     * const myDepependencyInstance = ctx("$inject:myDependencyKey")
     * @returns {Object} as result of Map operations
     */
    function contextOperation() {
        throw new Error('Wrong format of context invocation, $inject, $put, $get allowed only')
    }
    return new Proxy(contextOperation, {
        apply: function (target, thisArg, argumentsList) {
            const operation = argumentsList[0].split(':');
            const operationType = operation[0], operationKey = operation[1], operationItem = argumentsList[1];

            switch (operationType) {
                case '$inject':
                    return deps[operationKey];
                    break;
                case '$get': {
                    return pipe.getItem(operationKey, id);
                    break;
                }
                case '$put': {
                    return pipe.setItem(operationKey, operationItem);
                    return true;
                    break;
                }
                default:
                    return Reflect.apply(target, thisArg, argumentsList);
                    break;
            }
        }
    });
}

module.exports = contextFactory;