import { Event } from './Event';

export type NewCqcRecordEvent = Event<CqcRecordEntity> & {
  typeName: 'NewCqcRecordEvent',
}
export type UpdatedCqcRecordEvent = Event<CqcRecordEntity> & {
  typeName: 'UpdatedCqcRecordEvent',
}
export type RemovedCqcRecordEvent = Event<CqcRecordEntity> & {
  typeName: 'RemovedCqcRecordEvent',
}

// Set typeName options to CqcRecordEvent for use as type in stream
export type CqcRecordEvent = NewCqcRecordEvent | UpdatedCqcRecordEvent | RemovedCqcRecordEvent;

export type Entity = {
  id: Number,
  created: Date,
  updated?: Date,
  typeName: string, 
};

type CqcRecordEntity = Entity & {
  companyName: string,
  postcode?: string,
  address?: string,
  serviceType?: string,
  region?: Enumerator,
};

type Region = {
  getLatLong: () => [string];
  isInRegion: (lat: Number, long: Number) => Boolean;
};