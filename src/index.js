"use strict";
exports.__esModule = true;
console.log("hello world!");
var Stream_1 = require("./common/modules/Stream");
var testStream = new Stream_1.TestStream();
testStream.subscribe(function (event) {
    var payload = event.payload;
    // console.log(payload.)
    // if (event === NewCqcRecordEvent) {
    // } else {}
    console.log("event", event);
});
// const testPayload = CqcRecordEvent & {
//   id: 1,
//   created: new Date(),
//   typeName: string,
//   companyName: 'company'
// }
// testStream.emit({
//   date: new Date(),
//   entityId: "ku34hrwfuic7rtew",
//   typeName: "NewCqcRecordEvent",
//   payload: testPayload,
// });
// Index - Imports classes which are exported in other files
// RecordEvent - New || Updated || Deleted
// CQCRecordEvent <[subscribe] CQCEventStream
// CQCEventStream [extends]> Stream
// Stream [extends]> Event
// Event
// Batch Stream
