import { useRouter } from 'next/router'

import { Meta } from '@/layouts/Meta'
import { Main } from '@/templates/Main'
import dayjs from 'dayjs'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import styled from 'styled-components'

import {
  ClassAttributes,
  HTMLAttributes,
  JSXElementConstructor,
  LegacyRef,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useState
} from 'react'


// a little function to help us with reordering the result
const reorder = (list: ItemType[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed as ItemType)

  return result
}

const grid = 8

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightpurple' : 'lightpink',

  // styles we need to apply on draggables
  ...draggableStyle,
})

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? '#F0D9FF' : '#F3F1F5',
  padding: grid,
  width: 250,
})

type ItemType = {
  id: string
  content: string
}

const Container = styled.div``

const Index = () => {
  const [items, setItems] = useState<ItemType[]>([
    { id: 'item-0', content: 'task 1' },
    { id: 'item-1', content: 'task 2' },
    { id: 'item-2', content: 'task 3'},
  ])

  
  
  const onDragEnd = (result: {
    destination: { index: number }
    source: { index: number }
  }) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const newItems = reorder(
      items,
      result.source.index,
      result.destination.index
    )

    setItems(newItems)
  }


  return (
    <Main
      meta={
        <Meta
          title="Atomic Time Blocking"
          description="Time blocking in your browser"
        />
      }
    >
      <h1 className="m-5 text-center text-xl font-bold sm:m-3">Time blocks</h1>
      <div className="flex flex-row">
        <div className="basis-1/2">
          <h2 className="text-center">Tasks</h2>
          <div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(
                  provided: {
                    droppableProps: JSX.IntrinsicAttributes &
                      ClassAttributes<HTMLDivElement> &
                      HTMLAttributes<HTMLDivElement>
                    innerRef: LegacyRef<HTMLDivElement> | undefined
                    placeholder:
                      | string
                      | number
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | ReactFragment
                      | ReactPortal
                      | null
                      | undefined
                  },
                  snapshot: { isDraggingOver: any }
                ) => (
                  <Container
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    
                  >
                    {items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(
                          provided2: {
                            innerRef: LegacyRef<HTMLDivElement> | undefined
                            draggableProps: JSX.IntrinsicAttributes &
                              ClassAttributes<HTMLDivElement> &
                              HTMLAttributes<HTMLDivElement>
                            dragHandleProps: JSX.IntrinsicAttributes &
                              ClassAttributes<HTMLDivElement> &
                              HTMLAttributes<HTMLDivElement>
                          },
                          snapshot2: { isDragging: any }
                        ) => (
                          <Container
                            ref={provided2.innerRef}
                            {...provided2.draggableProps}
                            {...provided2.dragHandleProps}
                            style={getItemStyle(
                              snapshot2.isDragging,
                              provided2.draggableProps.style
                            )}
                            className="relative text-center"
                          >
                            {item.content}
                            <div className="absolute top-0 right-2">
                              x
                            </div>
                          </Container>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Container>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
        <div className="basis-1/2">
          <h2 className="text-center">Today&apos;s Agenda</h2>
          <div>

          </div>
        </div>
      </div>
    </Main>
  )
}

export default Index;
