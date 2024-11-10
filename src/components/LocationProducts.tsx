import React from 'react';
import { Product, StoreLocation } from '../types';
import { ProductListItem } from './ProductListItem';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

interface LocationProductsProps {
  location: StoreLocation;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export const LocationProducts = ({
  location,
  products,
  onEdit,
  onDelete
}: LocationProductsProps) => {
  const { setNodeRef } = useDroppable({
    id: location.id
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        {location.name}
      </h3>
      <SortableContext
        id={location.id}
        items={products}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="space-y-2">
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};