import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './index.module.css'

import dayjs from 'dayjs'
import Duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import moment from 'moment'
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types'
import {
  useCallback, useMemo, useState
} from 'react'
import {
  Calendar, DateLocalizer, momentLocalizer, Navigate, Views,
} from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import toast from 'react-hot-toast'
import { BsFillTrashFill } from 'react-icons/bs'
import ReactModal from 'react-modal'

import { Meta } from '@/layouts/Meta'
import { Main } from '@/templates/Main'

dayjs.extend(isBetween)
dayjs.extend(Duration)

ReactModal.setAppElement('#modal')

const mLocalizer = momentLocalizer(moment)

const grid = 8

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

type ItemType = {
  id: number
  content: string
  startDate: string
  endDate: string
  name: string
}

type EventType = {
  id: number,
  title: string,
  allDay: boolean,
  start: Date,
  end: Date,
  isDraggable: boolean,
}

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
      return date

    case Navigate.NEXT:
      return date

    default:
      return date
  }
}

MyDay.title = (date: Date) => `My awesome atomic day: ${date.toLocaleDateString()}`

const DnDCalendar = withDragAndDrop(Calendar)

function CustomView({ ...rest }) {
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
          {...rest}
        />
  )
}

CustomView.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}

type DraggedItemType = { title: string, name: string }

const Index = () => {
  const startTime = dayjs().minute() < 30 ? dayjs().minute(30).format() : dayjs().add(1, 'h').minute(0).format()

  const [items, setItems] = useState<ItemType[]>([
    {
      id: 0,
      content: 'task 1',
      startDate: dayjs(startTime).format(),
      endDate: dayjs(startTime).add(30, 'm').format(),
      name: escapeUnsafe('task 1')
    },
    {
      id: 1,
      content: 'task 2',
      startDate: dayjs(startTime).add(30, 'm').format(),
      endDate: dayjs(startTime).add(1, 'h').format(),
      name: escapeUnsafe('task 2')
    },
    {
      id: 2,
      content: 'task 3',
      startDate: dayjs(startTime).add(1, 'h').format(),
      endDate: dayjs(startTime).add(90, 'm').format(),
      name: escapeUnsafe('task 3')
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
    id: -1, title: 'placeholder', start: new Date(), end: new Date(), allDay: false, isDraggable: true
  })
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isDeleteEvent, setIsDeleteEvent] = useState<boolean>(false)

  const removeEvent = () => {
    const newEvents = (events || []).slice(0, selectedIndex).concat((events || []).slice(index + 1))
    setEvents(newEvents || [])
    setIsDeleteEvent(false)
    setSelectedIndex(-1)
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
      id: -1, title: 'placeholder', start: new Date(), end: new Date(), allDay: false, isDraggable: true
    })
    setSelectedIndex(-1)
    setIsEditEvent(false)
  }

  const updateEvent = () => {
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

  const removeItem = (index: number) => {
    const newItems = (items || []).slice(0, index).concat((items || [])?.slice(index + 1))

    const filteredEvents = events?.filter((e) => (e?.title !== items[index]?.content))
    setItems(newItems)
    setEvents(filteredEvents)
  }

  // eslint-disable-next-line max-len
  const handleDragStart = useCallback((event: { title: string, name: string }) => setDraggedEvent(event), [])

  // const dragFromOutsideItem = useCallback(() => draggedEvent, [draggedEvent])

  const moveEvent = useCallback(
    ({
      event, start, end, isAllDay: droppedOnAllDaySlot = false
    } : {
      event: EventType, start: Date, end: Date, isAllDay: boolean
    }): void => {
      const { allDay } = event
      if (!allDay && droppedOnAllDaySlot) {
        // eslint-disable-next-line no-param-reassign
        event.allDay = true
      }

      setEvents((prev: any) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, {
          ...existing, start, end, allDay
        }]
      })
    },
    [setEvents]
  )

  const newEvent = useCallback(
    (event: EventType) => {
      let newEventObject = {}
      setEvents((prev) => {
        const idList = prev.map((item) => item.id)
        const newId = Math.max(...idList) + 1
        newEventObject = { ...event, id: newId }
        return [...prev, { ...event, id: newId }]
      })
      onSelectEvent(newEventObject as EventType)
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
      const idList = events.map((item) => item.id)
      const newId = Math.max(...idList) + 1
      const event: EventType & { isAllDay: boolean } = {
        id: newId,
        title: rescapeUnsafe(name),
        start,
        end,
        isAllDay,
        allDay: isAllDay,
        isDraggable: true,
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
    ({ event, start, end } : {
      event: EventType,
      start: Date,
      end: Date,
    }) => {
      setEvents((prev: any) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end }]
      })
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



  return (
    <Main
      meta={
        <Meta
          title="Atomic Time Blocking"
          description="Elon Musk time blocking template in your browser"
        />
      }
    >
      <h1 className="m-5 text-center text-xl font-bold sm:m-3">Time blocks</h1>
      <div className="flex flex-row">
        <div className="basis-1/3 flex-col ">
          <div>
          <h2 className="text-center">Tasks</h2>
          </div>
          <div className="">
            <div className="">
              <div style={getListStyle2()}>
                {items.map((item, index) => (
                  <div
                    draggable="true"
                    key={item?.id}
                    onDragStart={() => handleDragStart(
                      { title: rescapeUnsafe(item?.name), name: item?.name }
                    )}
                    style={getItemStyle2()}
                    className="relative text-center"
                  >
                    {item.content}
                    <div onClick={() => removeItem(index)} className="absolute top-0 right-2">x</div>
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
            <button onClick={disableRemoveEvent} className="m-3 rounded-full border-black shadow hover:border-gray-700 focus:outline-none px-4 py-2">
              No
            </button>
            <button onClick={removeEvent} className="m-3 rounded-full bg-pink-700 text-white shadow hover:bg-pink-500 focus:outline-none px-4 py-2">
              Yes
            </button>
          </div>
        </div>
      </ReactModal>
      <div id="modal" />
    </Main>
  )
}

export default Index
