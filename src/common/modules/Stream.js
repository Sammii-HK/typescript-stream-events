"use strict";
exports.__esModule = true;
exports.TestStream = void 0;
;
;
var TestStream = /** @class */ (function () {
    function TestStream() {
        this.subscribers = [];
    }
    TestStream.prototype.subscribe = function (callback) {
        this.subscribers.push(callback);
    };
    ;
    TestStream.prototype.emit = function (event) {
        for (var _i = 0, _a = this.subscribers; _i < _a.length; _i++) {
            var subscriber = _a[_i];
            subscriber(event);
        }
    };
    ;
    return TestStream;
}());
exports.TestStream = TestStream;
;
