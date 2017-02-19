"use strict";
/**
 * Represents a pipe context object to be injected into plugins.  
 */
// module.exports = (function () {
//     /** @constructs Context */
//     var cls = function (id, pipe, dependencies) {
//         Object.assign(this, { id, pipe, dependencies });

//         /**
//          * Get/set parameters to/from entry pipe       
//          * @param {string} key  pipe value key
//          * @example
//          * 
//          * let param = ctx.$param['myParam'];      // get param from pipe
//          * ctx.$param['myParam']='myValue'         // save new value in pipe parameter      
//          * 
//          * @returns {Object}    Stored in pipe value
//          */
//         this.$param = new Proxy({}, {
//             get: (target, key) => {
//                 return pipe._get(key, id);
//             },
//             set: (target, key, value) => {
//                 pipe._set(key, value);
//                 return true;
//             }
//         });

//         /**
//          * Get plugins preconfigured dependencies      
//          * @param {string} id  serviceId
//          * @example
//          * 
//          * let myServiceInst = ctx.$inject['myService']; // get injected service instance         *          
//          * 
//          * @readonly
//          * @returns {Object}    Service instance
//          */
//         this.$inject = new Proxy({}, {
//             get: (target, key) => {
//                 return dependencies[key];
//             }
//         });
//     };
//     return cls;
// })();
// usage: ctx('$inject:cache')
// ctx('$get:myParam')
// ctx('$put:myParam',value)
// function Context(id, pipe, dependencies) {
//     Object.assign(this, { id, pipe, dependencies });

//     new Proxy(this, {
//         apply: function (target, thisArg, argumentsList) {
//             const operation = argumentsList[0].split(':');
//             const operationType = operation[0], operationKey = operation[1], operationItem = argumentsList[1];

//             switch (operationType) {
//                 case '$inject':
//                     return this.dependencies[operationKey];
//                     break;
//                 case '$get': {
//                     return this.pipe._get(operationKey, this.id);
//                     break;
//                 }
//                 case '$put': {
//                     pipe._set(operationKey, operationItem);
//                     return true;
//                     break;
//                 }
//                 default:
//                     throw new Error('Wrong format of context invocation, $inject and $param allowed only')
//                     break;
//             }
//         }
//     });
// };

// return Context;




function contextFactory(id, pipe, deps) {

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