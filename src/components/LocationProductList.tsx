import React from 'react';
import { Product } from '../types';
import { Draggable } from 'react-beautiful-dnd';
import { ProductListItem } from './ProductListItem';

interface LocationProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export const LocationProductList: React.FC<LocationProductListProps> = ({
  products,
  onEdit,
  onDelete
}) => {
  return (
    <>
      {products.map((product, index) => (
        <Draggable
          key={product.id}
          draggableId={product.id}
          index={index}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <ProductListItem
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
};