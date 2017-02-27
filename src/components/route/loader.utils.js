const R = require('ramda')
    , debug = require("debug")("gateway")
    , logger = require('../../../lib/logger')
    , pipeBuilder = require('./pipeBuilder')
    ;

module.exports = function () {
    let _pipePromise = R.reduce((p, fn) => p.then(fn));
    let _findAll = (model) => model.find();
    let _testEntryForErrors = R.curry(pipeBuilder.test);
    /** Entry became broken after deleting any required services */
    let _isNotBroken = (entry) => {
        let errors = _testEntryForErrors(entry.plugins);
        return !(errors.length > 0 && !R.equals(errors, entry.errors));
    };
    /** Entry became broken after deleting any required services */
    let _markBroken = (entry) => {
        let errors = _testEntryForErrors(entry.plugins);
        if (errors.length > 0 && !R.equals(errors, entry.errors)) {
            return {
                id: entry.id,
                errors: errors
            }
        }
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
        // also works fine
        // _findAll(model).then((models) => {
        //     const mArr = R.filter(isReadyToStart, models)
        // })
        return _pipePromise(_findAll(Entity), [_allReadyToStartList]);
    }

    function getBrokenEntries(Entity) {
        return _pipePromise(_findAll(Entity), [(models) => R.filter(R.identity, R.map(_markBroken, models))]);
    }

    function getEntriesToBeFixed(Entity) {
        return _pipePromise(_findAll(Entity), [(models) => R.filter(_isNeedToBeFixed, models)]);
    }

    return {
        getEntriesToHandle,
        getBrokenEntries,
        getEntriesToBeFixed
    };
}