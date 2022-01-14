import { CqcRecordEvent } from "./CQCRecordEvent";

export interface Stream<Event> {
  subscribe(callback: (event: Event) => void);
  emit(event: Event);
};

// Cqc stream
export interface CqcStream<CqcRecordEvent> extends Stream<CqcRecordEvent> {};

export class TestStream implements CqcStream<CqcRecordEvent> {
  subscribers: ((event: CqcRecordEvent) => void)[] = [];

  subscribe(callback: (event: CqcRecordEvent) => void) {
    this.subscribers.push(callback);
  };

  emit(event: CqcRecordEvent) {
    for (let subscriber of this.subscribers) {
      subscriber(event);
    }
  };
};
