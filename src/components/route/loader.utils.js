const R = require('ramda')
    , debug = require("debug")("gateway")
    , logger = require('../../../lib/logger')
    , pipeBuilder = require('./pipeBuilder')
    ;

module.exports = function () {
    // (p, fn) => p.then(fn) - функция агрегатор, кооторая запускается на каждом 
    // reduce waits for a binary function, the first argument being the accumulated value and the second one the element currently evaluated.
    let _pipePromise = R.reduce((p, fn) => p.then(fn))
    //const pipePromise2 = R.curry((list, acc) => list.reduce((acc, fn) => acc.then(fn), Promise.resolve(acc)));

    let _findAll = (model) => {
        let models = model.find();
        return models;
    }
    let _testEntryForErrors = R.curry(pipeBuilder.test);
    /** Entry became broken after deleting any required services */
    let _isNotBroken = (entry) => {
        let errors = _testEntryForErrors(entry.plugins);
        return !(errors.length > 0 && !R.equals(errors, entry.errors));
    };
    /** Entry became broken after deleting any required services */
    let _isBroken = (entry) => {
        let errors = _testEntryForErrors(entry.plugins);
        return (errors.length > 0 && !R.equals(errors, entry.errors));
    };
    /** Entry became fixed after changing configuration */
    let _isFixed = (entry) => {
        let errors = _testEntryForErrors(entry.plugins);
        return !(errors.length == 0 && entry.errors.length > 0);
    }
    /** Entry became fixed after changing configuration */
    let _isNeedToBeFixed = (entry) => {
        let errors = _testEntryForErrors(entry.plugins);
        return (errors.length == 0 && entry.errors.length > 0);
    }
    /** Entry became fixed after changing configuration */
    let _isActive = entry => entry.active;
    let _isNotBrokenOrAlreadyFixed = R.anyPass([_isNotBroken, _isFixed]);
    let _isOk = R.allPass([_isNotBrokenOrAlreadyFixed, _isActive]);
    let _allReadyToStartList = models => R.filter(_isOk, models);

    /**
     * pipePromise(_findAll, brokenEntries)
     */

    function getEntriesToHandle(Entity) {
        // also works
        // _findAll(model).then((models) => {
        //     const mArr = R.filter(isReadyToStart, models)
        // })

        return _pipePromise(_findAll(Entity), [_allReadyToStartList]) // _allReadyToStartList - это та функция, которую мы запускаем после промиса
    }

    function getBrokenEntries(Entity) {
        return _pipePromise(_findAll(Entity), [(models) => R.filter(_isBroken, models)])
    }

    function getEntriesToBeFixed(Entity) {
        return _pipePromise(_findAll(Entity), [(models) => R.filter(_isNeedToBeFixed, models)])
    }

    return {
        getEntriesToHandle,
        getBrokenEntries,
        getEntriesToBeFixed
    }

}