/* eslint-disable no-console */
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './index.module.css'

import dayjs from 'dayjs'
import Duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import moment from 'moment'
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types'
import {
  useCallback, useEffect, useMemo, useState
} from 'react'
import {
  Calendar, DateLocalizer, momentLocalizer, Navigate, Views,
} from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
// import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import toast from 'react-hot-toast'
import { BsFillTrashFill } from 'react-icons/bs'
import ReactModal from 'react-modal'
import { v4 as uuid } from 'uuid'

import { Meta } from '@/layouts/Meta'
import { Main } from '@/templates/Main'
import type { EventType, TaskType } from '@/utils/db';
import { db } from '@/utils/db'

dayjs.extend(isBetween)
dayjs.extend(Duration)

ReactModal.setAppElement('#modal')

const mLocalizer = momentLocalizer(moment)

const grid = 8

const TimeGrid = require('react-big-calendar/lib/TimeGrid')

const getItemStyle2 = () => ({
  // some basic styles to make the items look a bit nicer
  MozUserSelect: 'none',
  WebkitUserSelect: 'none',
  msUserSelect: 'none',

  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: 'lightpink',
})

const getListStyle2 = () => ({
  background: '#F3F1F5',
  padding: grid,
  width: '100%',
})

type MyWeekProps = {
  date: Date,
  localizer: any,
  max: Date,
  min: Date,
  scrollToTime: Date,
  [key: string]: any,
}

const escapeUnsafe = (unsafe: string) => unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')
  .replace(/ /gi, '-')

const rescapeUnsafe = (safe: string) => safe
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, '\'')
  .replace(/-/gi, ' ')

function MyDay({
  date,
  localizer,
  max = localizer.endOf(new Date(), 'day'),
  min = localizer.startOf(new Date(), 'day'),
  scrollToTime = localizer.startOf(new Date(), 'day'),
  ...props
}: MyWeekProps): JSX.Element {
  const currRange = useMemo(
    () => MyDay.range(date, { localizer }),
    [date, localizer]
  )

  return (
    <TimeGrid
      date={date}
      eventOffset={15}
      localizer={localizer}
      max={max}
      min={min}
      range={currRange}
      scrollToTime={scrollToTime}
      {...props}
    />
  )
}

MyDay.range = (date: Date, { localizer }: any) => {
  const start = date
  const end = date

  let current = start
  const range = []

  while (localizer.lte(current, end, 'day')) {
    range.push(current)
    current = localizer.add(current, 1, 'day')
  }

  return range
}

MyDay.navigate = (date: Date, action: any, { localizer }: any) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return localizer.add(date, -1, 'day')

    case Navigate.NEXT:
      return localizer.add(date, 1, 'day')

    default:
      return date
  }
}

MyDay.title = (date: Date) => `My awesome atomic day: ${date.toLocaleDateString()}`

const DnDCalendar = withDragAndDrop(Calendar)

function CustomView({ localizer, ...rest }: { [key: string]: any }) {
  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: new Date(),
      views: {
        month: false,
        week: false,
        day: MyDay,
      },
    }),
    []
  )

  return (
        <DnDCalendar
          defaultDate={defaultDate}
          defaultView={Views.DAY}
          views={views}
          localizer={localizer}
          {...rest}
        />
  )
}

CustomView.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}

type DraggedItemType = { title: string, name: string }

const Index = () => {
  // const localTasks = useLiveQuery(() => db?.tasks?.toArray())
  // const localEvents = useLiveQuery(() => db?.events?.toArray())

  const startTime = dayjs().minute() < 30 ? dayjs().minute(30).format() : dayjs().add(1, 'h').minute(0).format()

  const [tasks, setTasks] = useState<TaskType[]>([
    {
      _id: uuid(),
      id: uuid(),
      content: 'task 1',
      startDate: dayjs(startTime).format(),
      endDate: dayjs(startTime).add(30, 'm').format(),
      name: escapeUnsafe('task 1'),
      type: 'task'
    },
    {
      _id: uuid(),
      id: uuid(),
      content: 'task 2',
      startDate: dayjs(startTime).add(30, 'm').format(),
      endDate: dayjs(startTime).add(1, 'h').format(),
      name: escapeUnsafe('task 2'),
      type: 'task',
    },
    {
      _id: uuid(),
      id: uuid(),
      content: 'task 3',
      startDate: dayjs(startTime).add(1, 'h').format(),
      endDate: dayjs(startTime).add(90, 'm').format(),
      name: escapeUnsafe('task 3'),
      type: 'task',
    },
  ])

  const defaultCounter: any = {}
  defaultCounter[`${escapeUnsafe('task 1')}`] = 0
  defaultCounter[`${escapeUnsafe('task 2')}`] = 0
  defaultCounter[`${escapeUnsafe('task 3')}`] = 0

  const [events, setEvents] = useState<EventType[]>([])
  const [draggedEvent, setDraggedEvent] = useState<DraggedItemType | 'undroppable' | null>()
  const [counters, setCounters] = useState(defaultCounter)
  const [isEditEvent, setIsEditEvent] = useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = useState<EventType>({
    _id: uuid(),
    id: uuid(),
    title: 'placeholder',
    start: new Date(),
    end: new Date(),
    allDay: false,
    isDraggable: true,
    type: 'event'
  })
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isDeleteEvent, setIsDeleteEvent] = useState<boolean>(false)
  const [isNewTask, setIsNewTask] = useState<boolean>(false)
  const [newTask, setNewTask] = useState<TaskType | null>(null)

  // create index if doesn't exist
  useEffect(() => {
    (async () => {
      try {
        await db.createIndex({
          index: {
            fields: ['id']
          }
        })

        await db.createIndex({
          index: {
            fields: ['content']
          }
        })
      } catch (e) {
        console.log(e, ' unable to create index')
      }
    })()
  }, [])

  // get local events and tasks
  useEffect(() => {
    (async () => {
      try {
        const totalDocs = await db.allDocs<TaskType | EventType>({
          include_docs: true,
          attachments: true
        })

        console.log(totalDocs, ' these are totalDocs')

        const { rows } = totalDocs
        console.log(rows, ' these are rows')
        const oldTasks = rows?.filter((r) => (r?.doc?.type === 'task'))
        const oldEvents = rows?.filter((r) => (r?.doc?.type === 'event'))

        console.log(oldTasks, ' these are oldTasks')
        if (oldTasks?.length > 0) {
          const oldTaskObjects = oldTasks?.map((t) => (t?.doc)) as TaskType[]
          setTasks(oldTaskObjects || [])
        }

        if (oldEvents?.[0]?.doc?.id) {
          // eslint-disable-next-line max-len
          const oldEventObjects = oldEvents?.map((e) => ({
            ...e?.doc,
            start: new Date((e?.doc as EventType)?.start),
            end: new Date((e?.doc as EventType)?.end)
          }))
          setEvents(oldEventObjects as EventType[] || [])
        }
      } catch (e) {
        console.log(e, ' unable to get docs from pouchDb')
      }
    })()
  }, [])

  const removeEvent = async () => {
    const oldEvents = events
    // eslint-disable-next-line max-len
    const newEvents = (events || []).slice(0, selectedIndex).concat((events || []).slice(selectedIndex + 1))
    setEvents(newEvents || [])
    setIsDeleteEvent(false)
    setSelectedIndex(-1)
    try {
      const results = await db.find({
        selector: { id: { $eq: oldEvents?.[selectedIndex]?.id as string } }
      })
      console.log(results, ' results inside removeEvent')
      if (results?.docs?.[0]) {
        await db.remove(results?.docs?.[0])
      }
    } catch (e) {
      console.log(e, ' unable to remove event')
    }
  }

  const editEventContent = (event: any) => {
    setSelectedEvent({
      ...selectedEvent,
      title: event.target.value,
    })
  }

  const enableEdit = (index: number) => {
    if (events?.[index]) {
      setSelectedEvent(events?.[index] as EventType)
      setSelectedIndex(index)
      setIsEditEvent(true)
    } else {
      toast.error('Something went wrong with event editing')
    }
  }

  const onSelectEvent = useCallback((event: EventType) => {
    const index = events.findIndex((e) => e.id === event.id)
    enableEdit(index)
  }, [events])

  const disableEdit = () => {
    setSelectedEvent({
      _id: uuid(),
      id: uuid(),
      title: 'placeholder',
      start: new Date(),
      end: new Date(),
      allDay: false,
      isDraggable: true,
      type: 'event'
    })
    setSelectedIndex(-1)
    setIsEditEvent(false)
  }

  const updateEvent = async () => {
    

    let existingEvent: any = null
    try {
      const results = await db.find({
        selector: { id: { $eq: selectedEvent?.id as string } }
      })
      console.log(results, ' results inside updateEvent')
      existingEvent = results?.docs?.[0]
    } catch (e) {
      console.log(e, ' unable to get event')
    }

    if (!existingEvent || !(existingEvent?.id)) {
      try {
        await db.put({ ...selectedEvent, _id: uuid() } as EventType)
      } catch (e) {
        console.log(e, ' unable to add new event')
      }
    }
    const newEvents = events
      .slice(0, selectedIndex)
      .concat([selectedEvent])
      .concat(events.slice(selectedIndex + 1))

    setEvents(newEvents)
    disableEdit()
  }

  const enableRemoveEvent = () => {
    setIsEditEvent(false)
    setIsDeleteEvent(true)
  }

  const disableRemoveEvent = () => setIsDeleteEvent(false)

  const removeTask = async (index: number) => {
    const removedTask = tasks[index]
    // validate
    // eslint-disable-next-line no-underscore-dangle
    if (!removedTask || (removedTask && !(removedTask?._id))) {
      toast.error('No task to remove?!')
      return
    }
    const newItems = (tasks || []).slice(0, index).concat((tasks || [])?.slice(index + 1))

    const filteredEvents = events?.filter((e) => (e?.title !== tasks[index]?.content))

    setTasks(newItems)
    setEvents(filteredEvents)
    try {
      const taskResults = await db.find({
        selector: { id: { $eq: removedTask?.id as string } }
      })
      console.log(taskResults, ' taskResults inside removeTask')

      const eventResults = await db.find({
        selector: { content: { $eq: removedTask?.content } }
      })
      console.log(eventResults, ' eventResults insie removeTask')

      if (taskResults?.docs?.[0]) {
        await db.remove(taskResults?.docs?.[0])
      }

      const promises = eventResults?.docs?.map((e) => db.remove(e))
      await Promise.all(promises)
    } catch (e) {
      console.log(e, ' unable to remove task')
    }
  }

  // eslint-disable-next-line max-len
  const handleDragStart = useCallback((event: { title: string, name: string }) => setDraggedEvent(event), [])

  // const dragFromOutsideItem = useCallback(() => draggedEvent, [draggedEvent])

  const moveEvent = useCallback(
    async ({
      event, start, end, isAllDay: droppedOnAllDaySlot = false
    } : {
      event: EventType, start: Date, end: Date, isAllDay: boolean
    }): Promise<void> => {
      const { allDay } = event
      if (!allDay && droppedOnAllDaySlot) {
        // eslint-disable-next-line no-param-reassign
        event.allDay = true
      }

      setEvents((prev: any) => {
        const existing = prev.find((ev: { id: string }) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev: { id: string }) => ev.id !== event.id)
        return [...filtered, {
          ...existing, start, end, allDay
        }]
      })

      try {
        // await db.events.where('id').equals(event.id).modify({ start, end, allDay })
        const eventResults = await db.find({
          selector: { id: { $eq: event?.id as string } }
        })
        console.log(eventResults, ' eventResults inside moveEvent')
        if (eventResults?.docs?.[0]) {
          await db.put({
            ...eventResults?.docs?.[0],
            start,
            end,
            allDay
          })
        }
      } catch (e) {
        console.log(e, ' unable to move event inside db')
      }
    },
    [setEvents]
  )

  const addNewTask = () => {
    setNewTask({
      _id: uuid(),
      id: uuid(),
      content: 'New Task',
      startDate: dayjs().format(),
      endDate: dayjs().add(30, 'm').format(),
      name: escapeUnsafe('New Task'),
      type: 'task'
    })
    setIsNewTask(true)
  }

  const editTaskContent = (event: any) => {
    if (newTask && (newTask?.id)) {
      setNewTask({
        ...newTask,
        content: event.target.value,
        name: escapeUnsafe(event.target.value)
      })
    } else {
      toast.error('Something went wrong?!')
    }
  }

  // const enableNewTask = () => setIsNewTask(false)

  const disableNewTask = () => {
    setIsNewTask(false)
    setNewTask(null)
  }

  const saveNewTask = async () => {
    const newTasks = (tasks || []).concat([newTask as TaskType])
    setTasks(newTasks)
    disableNewTask()
    try {
      // await db.tasks.add(newTask as TaskType)
      await db.put({ ...newTask, _id: uuid() } as TaskType)
    } catch (e) {
      console.log(e, ' unable to save new task')
    }
  }

  const newEvent = useCallback(
    (event: EventType) => {
      let newEventObject = {}
      let newSelectedIndex = 0
      setEvents((prev) => {
        const newId = uuid()
        newSelectedIndex = prev?.length || 0
        newEventObject = { ...event, id: newId, _id: newId, }
        return [...prev, newEventObject as EventType]
      })
      setSelectedIndex(newSelectedIndex)
      setSelectedEvent(newEventObject as EventType)
      setIsEditEvent(true)
    },
    [setEvents]
  )

  const onDropFromOutside = useCallback(
    ({ start, end, allDay: isAllDay }: EventType) => {
      if (draggedEvent === 'undroppable') {
        setDraggedEvent(null)
        return
      }

      const { name } = draggedEvent as DraggedItemType
      const newId = uuid()
      const event: EventType & { isAllDay: boolean } = {
        _id: newId,
        id: newId,
        title: rescapeUnsafe(name),
        start,
        end,
        isAllDay,
        allDay: isAllDay,
        isDraggable: true,
        type: 'event'
      }
      setDraggedEvent(null)
      setCounters((prev: any) => {
        const { [name]: count } = prev
        return {
          ...prev,
          [name]: count + 1,
        }
      })
      setSelectedEvent(event)
      // eslint-disable-next-line no-unsafe-optional-chaining
      const newSelectedIndex = (events?.length) || 0
      setSelectedIndex(newSelectedIndex)
      setIsEditEvent(true)
      setEvents((prev) => [...prev, { ...event, id: newId }])
    },
    [draggedEvent, counters, setDraggedEvent, setCounters, newEvent]
  )

  const resizeEvent = useCallback(
    async ({ event, start, end } : {
      event: EventType,
      start: Date,
      end: Date,
    }) => {
      setEvents((prev: any) => {
        const existing = prev.find((ev: { id: string }) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev: { id: string }) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end }]
      })

      try {
        // await db.events.where('id').equals(event?.id).modify({ start, end })
        const results = await db.find({
          selector: { id: { $eq: event?.id } }
        })

        if (results?.docs?.[0]) {
          await db.put({
            ...results?.docs?.[0],
            start,
            end,
          })
        }
      } catch (e) {
        console.log(e, ' unable to modify event inside resizeEvent')
      }
    },
    [setEvents]
  )

  const defaultDate = useMemo(() => new Date(), [])

  const customOnDragOver = useCallback(
    (dragEvent: { preventDefault: () => void }) => {
      // check for undroppable is specific to this example
      // and not part of API. This just demonstrates that
      // onDragOver can optionally be passed to conditionally
      // allow draggable items to be dropped on cal, based on
      // whether event.preventDefault is called
      dragEvent.preventDefault()
    },
    [draggedEvent]
  )

  console.log(tasks, ' tasks')
  console.log(events, ' events')
  console.log(newTask, ' newTask')

  return (
    <Main
      meta={
        <Meta
          title="Atomic Time Blocking"
          description="Elon Musk time blocking template in your browser"
        />
      }
    >
      <div className="">
        <h1 className="m-5 text-center text-xl font-bold sm:m-3">Time blocks</h1>
        <div className="relative m-3 flex w-full flex-row justify-end">
          <button className=" mr-3 rounded-full bg-pink-700 px-4 py-2 text-white shadow hover:bg-pink-500 focus:outline-none" onClick={addNewTask}>
            {'+ Add Task'}
          </button>
        </div>

        <div className="flex flex-row">
          <div className="basis-1/3 flex-col ">
            <div>
            <h2 className="text-center">Tasks</h2>
            </div>
            <div className="">
              <div className="">
                <div style={getListStyle2()} className="h-screen">
                  {tasks.map((item, index) => (
                    <div
                      draggable="true"
                      key={item?.id}
                      onDragStart={() => handleDragStart(
                        { title: item?.content, name: item?.name }
                      )}
                      style={getItemStyle2()}
                      className="relative text-center"
                    >
                      {item.content}
                      <div onClick={() => removeTask(index)} className="absolute top-0 right-2">x</div>
                    </div>
                  ))}
                </div>

                </div>
            </div>
          </div>
          <div className="basis-2/3">
            <h2 className="text-center">Today&apos;s Agenda</h2>
            <div className="h-screen">
              <CustomView
                defaultDate={defaultDate}
                localizer={mLocalizer}
                events={events}
                draggableAccessor={() => true}
                resizable
                selectable
                views={Views.DAY}
                step={5}
                onDropFromOutside={onDropFromOutside}
                onEventDrop={moveEvent}
                onEventResize={resizeEvent}
                onSelectSlot={newEvent}
                onDragOver={customOnDragOver}
                onSelectEvent={onSelectEvent}
                scrollToTime={new Date()}
              />
            </div>
          </div>
        </div>
        <ReactModal
          isOpen={isEditEvent}
          onRequestClose={disableEdit}
          className=""
        >
          <div className=" flex h-full w-full flex-col items-center justify-center" >
            <label className="block">
              <span className="text-gray-700">Content</span>
              <textarea
                className="form-textarea mt-1 block w-full"
                placeholder="event"
                onChange={editEventContent}
                value={selectedEvent.title}
              />
            </label>
            <div className="flex flex-row items-center justify-center">
              <button className="m-3 rounded-full border-black px-4 py-2 shadow hover:border-gray-700 focus:outline-none" onClick={disableEdit}>
                  Cancel
              </button>
              <button className="m-3 rounded-full bg-pink-700 px-4 py-2 text-white shadow hover:bg-pink-500 focus:outline-none" onClick={updateEvent}>
                  Save
              </button>
            </div>
          </div>
          <div onClick={enableRemoveEvent} className="absolute bottom-2 right-2 text-gray-900 hover:text-gray-600">
            <BsFillTrashFill />
          </div>
        </ReactModal>
        <ReactModal
          isOpen={isDeleteEvent}
          onRequestClose={disableRemoveEvent}
          className=""
        >
          <div className="flex h-full w-full flex-col items-center justify-center">
            <h2 className="text-center text-base">
              Do you want to delete event?
            </h2>
            <div className="flex flex-row items-center justify-center">
              <button onClick={disableRemoveEvent} className="m-3 rounded-full border-black px-4 py-2 shadow hover:border-gray-700 focus:outline-none">
                No
              </button>
              <button onClick={removeEvent} className="m-3 rounded-full bg-pink-700 px-4 py-2 text-white shadow hover:bg-pink-500 focus:outline-none">
                Yes
              </button>
            </div>
          </div>
        </ReactModal>
        <ReactModal
          isOpen={isNewTask}
          onRequestClose={disableNewTask}
        >
          <div className=" flex h-full w-full flex-col items-center justify-center" >
             <label className="block">
              <span className="text-gray-700">Content</span>
              <textarea
                className="form-textarea mt-1 block w-full"
                placeholder="event"
                onChange={editTaskContent}
                value={newTask?.content}
              />
            </label>
            <div className="flex flex-row items-center justify-center">
              <button className="m-3 rounded-full border-black px-4 py-2 shadow hover:border-gray-700 focus:outline-none" onClick={disableNewTask}>
                  Cancel
              </button>
              <button className="m-3 rounded-full bg-pink-700 px-4 py-2 text-white shadow hover:bg-pink-500 focus:outline-none" onClick={saveNewTask}>
                  Save
              </button>
            </div>
          </div>
        </ReactModal>
        <div id="modal" />
      </div>
    </Main>
  )
}

export default Index
