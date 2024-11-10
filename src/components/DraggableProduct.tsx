import React from 'react';
import { Product } from '../types';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface DraggableProductProps {
  product: Product;
  index: number;
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export const DraggableProduct: React.FC<DraggableProductProps> = ({
  product,
  index,
  onEdit,
  onDelete
}) => {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      
      if (error) {
        toast.error('Error deleting product');
        return;
      }
      
      toast.success('Product deleted');
      onDelete();
    }
  };

  return (
    <Draggable draggableId={product.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
              {...provided.dragHandleProps}
              className="text-gray-400 cursor-grab"
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {product.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sequence: {product.sequence_number}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};