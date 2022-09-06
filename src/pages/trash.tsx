
/**
 * <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <Container
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={`${item.id}`}
                          index={index}
                        >
                          {(provided2, snapshot2) => (
                            <Container
                              ref={provided2.innerRef}
                              {...provided2.draggableProps}
                              {...provided2.dragHandleProps}
                              style={getItemStyle(
                                snapshot2.isDragging,
                                provided2.draggableProps.style
                              )}
                              className="relative text-center"
                              draggable="true"
                              key={item?.id}
                              onDragStart={() => handleDragStart(
                                { title: rescapeUnsafe(item?.name), name: item?.name }
                              )}
                            >
                              {item.content}
                              <div onClick={() => removeItem(index)} className="absolute top-0 right-2">x</div>
                            </Container>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Container>
                  )}
                </Droppable>
                </DragDropContext>
 */