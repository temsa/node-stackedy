var stackedy = require('../../../');
var exports = module.exports = function (fn, context) {
    stack.include('(' + fn.toString() + ')()', {
        filename : context.__filename,
        context : context
    });
};
var stack = exports.stack = stackedy();
