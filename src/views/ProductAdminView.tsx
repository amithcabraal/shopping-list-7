import React, { useState, useEffect } from 'react';
import { Product, StoreLocation } from '../types';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductForm } from '../components/ProductForm';
import { LocationProducts } from '../components/LocationProducts';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

const ProductAdminView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, locationsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, location:store_locations(*)')
        .order('sequence_number'),
      supabase
        .from('store_locations')
        .select('*')
        .order('sequence_number')
    ]);

    if (productsRes.error) toast.error('Error fetching products');
    if (locationsRes.error) toast.error('Error fetching locations');

    setProducts(productsRes.data || []);
    setLocations(locationsRes.data || []);
    setLoading(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeProduct = products.find(p => p.id === active.id);
    const overProduct = products.find(p => p.id === over.id);

    if (!activeProduct || !overProduct) return;

    if (active.id !== over.id) {
      const oldIndex = products.findIndex(p => p.id === active.id);
      const newIndex = products.findIndex(p => p.id === over.id);

      const newSequence = calculateNewSequence(oldIndex, newIndex, products);

      const { error } = await supabase
        .from('products')
        .update({
          sequence_number: newSequence,
          store_location_id: overProduct.store_location_id
        })
        .eq('id', active.id);

      if (error) {
        toast.error('Failed to update product order');
        return;
      }

      setProducts(arrayMove(products, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const calculateNewSequence = (oldIndex: number, newIndex: number, items: Product[]) => {
    if (newIndex === 0) {
      return items[0].sequence_number - 10;
    }
    if (newIndex === items.length - 1) {
      return items[items.length - 1].sequence_number + 10;
    }
    const prevSequence = items[newIndex - 1].sequence_number;
    const nextSequence = items[newIndex].sequence_number;
    return Math.floor((prevSequence + nextSequence) / 2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      aliases: (formData.get('aliases') as string)?.split(',').map(a => a.trim()).filter(Boolean) || null,
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
      }

      setEditingProduct(null);
      setShowForm(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // Group products by location
  const groupedProducts = products.reduce((acc, product) => {
    const locationId = product.store_location_id;
    if (!acc[locationId]) acc[locationId] = [];
    acc[locationId].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {showForm ? (editingProduct ? 'Edit Product' : 'Add New Product') : 'Products'}
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          )}
        </div>

        {showForm && (
          <ProductForm
            editingProduct={editingProduct}
            locations={locations}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingProduct(null);
              setShowForm(false);
            }}
          />
        )}
      </div>

      {!showForm && (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={products}
            strategy={verticalListSortingStrategy}
          >
            {locations.map(location => (
              <LocationProducts
                key={location.id}
                location={location}
                products={groupedProducts[location.id] || []}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setShowForm(true);
                }}
                onDelete={fetchData}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ProductAdminView;