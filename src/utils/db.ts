import PouchDB from 'pouchdb';
import pouchDbFind from 'pouchdb-find'
// import type { Table } from 'dexie';
// import Dexie from 'dexie';

PouchDB.plugin(pouchDbFind)

export interface TaskType {
  _id: string
  _rev?: string
  id: string
  content: string
  startDate: string
  endDate: string
  name: string
  type: 'task'
}

export interface EventType {
  _id: string
  _rev?: string
  id: string,
  title: string,
  allDay: boolean,
  start: Date,
  end: Date,
  isDraggable: boolean,
  type: 'event'
}

export const db = new PouchDB('atomic')

