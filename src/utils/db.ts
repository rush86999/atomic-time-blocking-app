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

db.info().then((info) => {
  // eslint-disable-next-line no-console
  console.log(info);
})

/**
 * {
  "_id": "mittens",
  "name": "Mittens",
  "occupation": "kitten",
  "age": 3,
  "hobbies": [
    "playing with balls of yarn",
    "chasing laser pointers",
    "lookin' hella cute"
  ]
}

 */

// export class MySubClassedDexie extends Dexie {
//   // 'friends' is added by dexie when declaring the stores()
//   // We just tell the typing system this is the case
//   tasks!: Table<TaskType>

//   events!: Table<EventType>

//   constructor() {
//     super('myDatabase');
//     this.version(1).stores({
//       tasks: '++id, content, startDate, endDate, name', // Primary key and indexed props,
//       events: '++id, title, allDay, start, end, isDraggable'
//     });
//   }
// }

// export const db = new MySubClassedDexie();
