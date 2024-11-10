import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WeeklyShop } from '../types';
import { ProductList } from '../components/ProductList';
import { ShoppingCart, Filter, SortAsc } from 'lucide-react';
import toast from 'react-hot-toast';

const ShopView = () => {
  const [currentShop, setCurrentShop] = useState<WeeklyShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'location' | 'alphabetical'>('location');

  useEffect(() => {
    const fetchCurrentShop = async () => {
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
        .order('shop_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        toast.error('Error fetching shop data');
        return;
      }

      setCurrentShop(shopData);
      setLoading(false);
    };

    fetchCurrentShop();

    const subscription = supabase
      .channel('shop_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'weekly_shop_items' 
      }, () => {
        fetchCurrentShop();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const shareUnavailableItems = async () => {
    if (!currentShop) return;

    const unavailableItems = currentShop.items
      .filter(item => item.status === 'unavailable')
      .map(item => item.product?.name)
      .filter(Boolean)
      .join('\n');

    if (!unavailableItems) {
      toast.info('No unavailable items to share');
      return;
    }

    const shareText = `Unavailable Items:\n${unavailableItems}`;

    try {
      await navigator.share({
        title: 'Unavailable Items',
        text: shareText
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success('Unavailable items copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-12 h-12 mx-auto text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No active shopping list</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new shopping list to get started
        </p>
      </div>
    );
  }

  const filteredItems = currentShop.items.filter(
    item => showCompleted || item.status === 'required'
  );

  // Sort items based on selected sort method
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'location') {
      // First sort by location sequence
      const locationDiff = (a.product?.location?.sequence_number || 0) - (b.product?.location?.sequence_number || 0);
      if (locationDiff !== 0) return locationDiff;
      // Then by product sequence within location
      return (a.product?.sequence_number || 0) - (b.product?.sequence_number || 0);
    } else {
      // Alphabetical sort
      return (a.product?.name || '').localeCompare(b.product?.name || '');
    }
  });

  // Group items by location for headings
  const itemsByLocation = sortedItems.reduce((acc, item) => {
    const locationName = item.product?.location?.name || 'Other';
    if (!acc[locationName]) acc[locationName] = [];
    acc[locationName].push(item);
    return acc;
  }, {} as Record<string, typeof sortedItems>);

  const progress = {
    total: currentShop.items.length,
    completed: currentShop.items.filter(item => item.status === 'bought').length,
    unavailable: currentShop.items.filter(item => item.status === 'unavailable').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Shopping Progress</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.completed} of {progress.total} items collected
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy(prev => prev === 'location' ? 'alphabetical' : 'location')}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <SortAsc className="w-4 h-4" />
              Sort by {sortBy === 'location' ? 'Location' : 'Name'}
            </button>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <Filter className="w-4 h-4" />
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
            <button
              onClick={shareUnavailableItems}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Share Unavailable
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{
              width: `${(progress.completed / progress.total) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {Object.entries(itemsByLocation).map(([location, locationItems]) => (
        <div key={location} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 px-4">
            {location}
          </h3>
          <ProductList items={locationItems} viewMode="shop" />
        </div>
      ))}
    </div>
  );
};

export default ShopView;