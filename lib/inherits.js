module.exports = function inherit(cls, superCls) {
    var construct = function () { };
    construct.prototype = superCls.prototype;
    cls.prototype = new construct;
    cls.prototype.constructor = cls;
    cls.super = superCls;
}