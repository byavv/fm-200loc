/**
 * @module App state 
 */

/** 
 * @typedef State
 * @type {object}
 * @property {Map} servicesStore - services metadata store.
 * @property {Array} services - services constructors to be consumed by dashboard.
 * @property {Array} plugins - plugins constructors to be consumed by dashboard.
 * @property {Object} rules - routing rules.
 * @property {boolean} ready - ready state.
 * 
 */
const state = {
    servicesStore: new Map(),
    services: [],
    plugins: [],
    rules: {},
    ready: false
};
module.exports = Object.seal(state);