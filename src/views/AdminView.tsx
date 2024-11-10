import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, StoreLocation } from '../types';
import { Plus, Edit2, Trash2, GripVertical, Link2, Image, Info } from 'lucide-react';
import toast from 'react-hot-toast';

// Local storage keys
const LAST_LOCATION_KEY = 'lastUsedLocationId';
const LAST_SEQUENCE_KEY = 'lastUsedSequence';

const AdminView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [aliases, setAliases] = useState<string>('');
  const [defaultLocationId, setDefaultLocationId] = useState<string>('');
  const [defaultSequence, setDefaultSequence] = useState<number>(0);
  const [maxSequenceByLocation, setMaxSequenceByLocation] = useState<Record<string, number>>({});
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  useEffect(() => {
    fetchData();
    
    // Load defaults from local storage
    const savedLocationId = localStorage.getItem(LAST_LOCATION_KEY);
    const savedSequence = localStorage.getItem(LAST_SEQUENCE_KEY);
    
    if (savedLocationId) {
      setDefaultLocationId(savedLocationId);
      setSelectedLocationId(savedLocationId);
    }
    if (savedSequence) setDefaultSequence(parseInt(savedSequence, 10));
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setAliases(editingProduct.aliases?.join(', ') || '');
      setSelectedLocationId(editingProduct.store_location_id);
    } else {
      setAliases('');
    }
  }, [editingProduct]);

  useEffect(() => {
    // Calculate max sequence number for each location
    const maxSeq: Record<string, number> = {};
    products.forEach(product => {
      const locationId = product.store_location_id;
      maxSeq[locationId] = Math.max(maxSeq[locationId] || 0, product.sequence_number || 0);
    });
    setMaxSequenceByLocation(maxSeq);
  }, [products]);

  const fetchData = async () => {
    const [productsRes, locationsRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('store_locations').select('*').order('sequence_number')
    ]);

    if (productsRes.error) toast.error('Error fetching products');
    if (locationsRes.error) toast.error('Error fetching locations');

    setProducts(productsRes.data || []);
    setLocations(locationsRes.data || []);
    setLoading(false);
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    localStorage.setItem(LAST_LOCATION_KEY, locationId);
    const nextSequence = (maxSequenceByLocation[locationId] || 0) + 3;
    setDefaultSequence(nextSequence);
    localStorage.setItem(LAST_SEQUENCE_KEY, nextSequence.toString());
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const productData = {
      name: formData.get('name') as string,
      store_location_id: formData.get('location') as string,
      shelf_height: formData.get('shelf_height') as 'top' | 'middle' | 'bottom',
      typical_price: formData.get('typical_price') ? 
        parseFloat(formData.get('typical_price') as string) : null,
      notes: formData.get('notes') as string,
      sequence_number: parseInt(formData.get('sequence_number') as string) || 0,
      product_url: formData.get('product_url') as string || null,
      image_url: formData.get('image_url') as string || null,
      barcode: formData.get('barcode') as string || null,
      aliases: aliases.split(',').map(a => a.trim()).filter(a => a),
      default_quantity: parseInt(formData.get('default_quantity') as string) || 1
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
        toast.success('Product added');
        
        // Save last used values
        localStorage.setItem(LAST_LOCATION_KEY, productData.store_location_id);
        localStorage.setItem(LAST_SEQUENCE_KEY, productData.sequence_number.toString());
      }

      setEditingProduct(null);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const locationData = {
      name: formData.get('name') as string,
      sequence_number: parseInt(formData.get('sequence_number') as string) || locations.length + 1
    };

    try {
      const { error } = editingLocation ?
        await supabase
          .from('store_locations')
          .update(locationData)
          .eq('id', editingLocation.id) :
        await supabase
          .from('store_locations')
          .insert(locationData);

      if (error) throw error;

      toast.success(`Location ${editingLocation ? 'updated' : 'added'}`);
      setEditingLocation(null);
      setShowLocationForm(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving location');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Products Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={editingProduct?.name}
                required
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Aliases</label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Comma-separated aliases"
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
              <select
                name="location"
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                required
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Sequence Number
                <div className="absolute -right-6 top-0">
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400" />
                    <div className="hidden group-hover:block absolute left-full top-0 ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                      Current highest sequence: {maxSequenceByLocation[selectedLocationId] || 0}
                      <br />
                      Suggested next: {(maxSequenceByLocation[selectedLocationId] || 0) + 3}
                    </div>
                  </div>
                </div>
              </label>
              <input
                type="number"
                name="sequence_number"
                defaultValue={editingProduct?.sequence_number || defaultSequence}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Shelf Height</label>
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
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Default Quantity</label>
              <input
                type="number"
                name="default_quantity"
                defaultValue={editingProduct?.default_quantity || 1}
                min="1"
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Typical Price</label>
              <input
                type="number"
                name="typical_price"
                step="0.01"
                defaultValue={editingProduct?.typical_price}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product URL</label>
              <input
                type="url"
                name="product_url"
                defaultValue={editingProduct?.product_url}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Image URL</label>
              <input
                type="url"
                name="image_url"
                defaultValue={editingProduct?.image_url}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Barcode</label>
              <input
                type="text"
                name="barcode"
                defaultValue={editingProduct?.barcode}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              name="notes"
              defaultValue={editingProduct?.notes}
              className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingProduct && (
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Locations Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Store Locations</h2>
          <button
            onClick={() => setShowLocationForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Location
          </button>
        </div>

        {showLocationForm && (
          <form onSubmit={handleLocationSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingLocation?.name}
                  required
                  className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sequence Number</label>
                <input
                  type="number"
                  name="sequence_number"
                  defaultValue={editingLocation?.sequence_number}
                  required
                  className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowLocationForm(false);
                  setEditingLocation(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingLocation ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {locations.map(location => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{location.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sequence: {location.sequence_number}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLocation(location);
                    setShowLocationForm(true);
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this location?')) {
                      const { error } = await supabase
                        .from('store_locations')
                        .delete()
                        .eq('id', location.id);
                      
                      if (error) {
                        toast.error('Error deleting location');
                        return;
                      }
                      
                      toast.success('Location deleted');
                      fetchData();
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Products</h2>
        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {locations.find(l => l.id === product.store_location_id)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
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
                      fetchData();
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminView;