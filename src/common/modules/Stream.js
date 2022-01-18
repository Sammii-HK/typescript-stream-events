"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStream = void 0;
;
;
class TestStream {
    subscribers = [];
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    ;
    emit(event) {
        for (let subscriber of this.subscribers) {
            subscriber(event);
        }
    }
    ;
}
exports.TestStream = TestStream;
;
