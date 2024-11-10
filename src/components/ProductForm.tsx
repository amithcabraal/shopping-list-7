import React, { useEffect, useState } from 'react';
import { Product, StoreLocation } from '../types';
import { supabase } from '../lib/supabase';

interface ProductFormProps {
  editingProduct: Product | null;
  locations: StoreLocation[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  editingProduct,
  locations,
  onSubmit,
  onCancel
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    editingProduct?.store_location_id || localStorage.getItem('lastUsedLocation') || ''
  );
  const [maxSequence, setMaxSequence] = useState<number>(0);

  useEffect(() => {
    if (selectedLocation) {
      fetchMaxSequence();
      localStorage.setItem('lastUsedLocation', selectedLocation);
    }
  }, [selectedLocation]);

  const fetchMaxSequence = async () => {
    const { data } = await supabase
      .from('products')
      .select('sequence_number')
      .eq('store_location_id', selectedLocation)
      .order('sequence_number', { ascending: false })
      .limit(1);

    setMaxSequence(data?.[0]?.sequence_number || 0);
  };

  const defaultSequence = editingProduct?.sequence_number || maxSequence + 3;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={editingProduct?.name}
            required
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Location
          </label>
          <select
            name="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            required
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          >
            <option value="">Select location...</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Shelf Height
          </label>
          <select
            name="shelf_height"
            defaultValue={editingProduct?.shelf_height}
            required
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Typical Price
          </label>
          <input
            type="number"
            name="typical_price"
            step="0.01"
            defaultValue={editingProduct?.typical_price}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Default Quantity
          </label>
          <input
            type="number"
            name="default_quantity"
            min="1"
            defaultValue={editingProduct?.default_quantity || 1}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Sequence Number
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Current max: {maxSequence})
            </span>
          </label>
          <input
            type="number"
            name="sequence_number"
            defaultValue={defaultSequence}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Product URL
          </label>
          <input
            type="url"
            name="product_url"
            defaultValue={editingProduct?.product_url}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Image URL
          </label>
          <input
            type="url"
            name="image_url"
            defaultValue={editingProduct?.image_url}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Barcode
          </label>
          <input
            type="text"
            name="barcode"
            defaultValue={editingProduct?.barcode}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Aliases (comma-separated)
          </label>
          <input
            type="text"
            name="aliases"
            defaultValue={editingProduct?.aliases?.join(', ')}
            className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={editingProduct?.notes}
          className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};