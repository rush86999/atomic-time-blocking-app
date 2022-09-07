import Image from 'next/image'
import { useRouter } from 'next/router'

import { Meta } from '@/layouts/Meta'
import { Main } from '@/templates/Main'

const About = () => {
  const router = useRouter()
  const addTask = `${router.basePath}/assets/images/addTask.webp`
  const dragTaskToEvent = `${router.basePath}/assets/images/dragTaskToEvent.webp`
  const createNewEvent = `${router.basePath}/assets/images/createNewEvent.webp`
  const deleteEvent = `${router.basePath}/assets/images/deleteEvent.webp`
  const editEvent = `${router.basePath}/assets/images/editEvent.webp`
  const expandEvent = `${router.basePath}/assets/images/expandEvent.webp`
  const moveEvent = `${router.basePath}/assets/images/moveEvent.webp`

  return (
  <Main meta={<Meta title="How to use time blocking" description="Learn how to use time blocking to schedule your day" />}>
    <div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Add a task
        </h3>
        <div>
          <Image
            src={addTask}
            alt="AddTask"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Drag a task to event
        </h3>
        <div>
          <Image
            src={dragTaskToEvent}
            alt="DragTaskToEvent"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Create a new event
        </h3>
        <div>
          <Image
            src={createNewEvent}
            alt="CreateNewEvent"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Delete an event
        </h3>
        <div>
          <Image
            src={deleteEvent}
            alt="DeleteEvent"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Edit an event
        </h3>
        <div>
          <Image
            src={editEvent}
            alt="EditEvent"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Expand an event
        </h3>
        <div>
          <Image
            src={expandEvent}
            alt="ExpandEvent"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
        <h3 className="m-3 text-xl font-semibold text-gray-700">
          Move an event
        </h3>
        <div>
          <Image
            src={moveEvent}
            alt="MoveEvent"
            layout="intrinsic"
            width={700}
            height={475}
          />
        </div>
    </div>
  </Main>
  )
}

export default About
