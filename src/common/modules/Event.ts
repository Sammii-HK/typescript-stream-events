// Set unique types for CqcRecordEvent
type Uuid = string;

export interface Event<T> {
  typeName: string,
  // type: ET,
  payload: T,
  date: Date,
  entityId: Uuid,
}
