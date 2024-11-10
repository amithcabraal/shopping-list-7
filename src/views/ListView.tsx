import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WeeklyShop } from '../types';
import { Search, Plus, Mic, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { ShoppingList } from '../components/ShoppingList';

const ListView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentShop, setCurrentShop] = useState<WeeklyShop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentShop();
  }, []);

  const fetchCurrentShop = async () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: shopData, error } = await supabase
      .from('weekly_shops')
      .select(`
        *,
        items:weekly_shop_items(
          *,
          product:products(
            *,
            location:store_locations(*)
          )
        )
      `)
      .gte('shop_date', startOfWeek.toISOString())
      .order('shop_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast.error('Error fetching current shop');
      return;
    }

    setCurrentShop(shopData);
    setLoading(false);
  };

  const createNewList = async () => {
    const { data: newShop, error } = await supabase
      .from('weekly_shops')
      .insert([{ shop_date: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      toast.error('Error creating new list');
      return;
    }

    setCurrentShop({ ...newShop, items: [] });
    toast.success('New shopping list created');
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!currentShop ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">No Shopping List for This Week</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Would you like to create a new shopping list?
          </p>
          <button
            onClick={createNewList}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create New List
          </button>
        </div>
      ) : (
        <>
          <form className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Mic className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {currentShop.items && currentShop.items.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Current List</h3>
              <ShoppingList 
                items={currentShop.items} 
                viewMode="list" 
                onItemRemoved={(itemId) => {
                  setCurrentShop(prev => prev ? {
                    ...prev,
                    items: prev.items.filter(item => item.id !== itemId)
                  } : null);
                }}
                onQuantityChanged={(itemId, newQuantity) => {
                  setCurrentShop(prev => prev ? {
                    ...prev,
                    items: prev.items.map(item => 
                      item.id === itemId ? { ...item, quantity: newQuantity } : item
                    )
                  } : null);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListView;