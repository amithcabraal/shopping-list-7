import React from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

interface DroppableContainerProps extends Omit<DroppableProps, 'children'> {
  children: (provided: any) => React.ReactNode;
  className?: string;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  droppableId,
  children,
  className = '',
  ...props
}) => (
  <Droppable droppableId={droppableId} {...props}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={className}
      >
        {children(provided)}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);