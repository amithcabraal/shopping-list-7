import React from 'react';
import { Product, StoreLocation } from '../types';
import { Droppable } from 'react-beautiful-dnd';
import { LocationProductList } from './LocationProductList';

interface AdminProductListProps {
  locations: StoreLocation[];
  groupedProducts: Record<string, Product[]>;
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export const AdminProductList: React.FC<AdminProductListProps> = ({
  locations,
  groupedProducts,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-6">
      {locations.map(location => (
        <div
          key={location.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {location.name}
          </h3>
          <Droppable droppableId={location.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                <LocationProductList
                  products={groupedProducts[location.id] || []}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}
    </div>
  );
};