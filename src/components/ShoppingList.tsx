import React from 'react';
import { WeeklyShopItem } from '../types';
import { Check, X, AlertCircle, Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ShoppingListProps {
  items: WeeklyShopItem[];
  viewMode: 'list' | 'shop';
  onItemRemoved?: (itemId: string) => void;
  onQuantityChanged?: (itemId: string, newQuantity: number) => void;
}

export const ShoppingList = ({ 
  items = [], 
  viewMode, 
  onItemRemoved, 
  onQuantityChanged 
}: ShoppingListProps) => {
  const updateItemStatus = async (itemId: string, status: WeeklyShopItem['status']) => {
    const { error } = await supabase
      .from('weekly_shop_items')
      .update({ status })
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to update item status');
      return;
    }
  };

  const updateQuantity = async (item: WeeklyShopItem, delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    
    const { error } = await supabase
      .from('weekly_shop_items')
      .update({ quantity: newQuantity })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update quantity');
      return;
    }

    onQuantityChanged?.(item.id, newQuantity);
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('weekly_shop_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to remove item');
      return;
    }

    onItemRemoved?.(itemId);
    toast.success('Item removed from list');
  };

  const sortedItems = [...items].sort((a, b) => {
    if (viewMode === 'shop') {
      // Sort by store location sequence and shelf height
      if (a.product?.store_location_id !== b.product?.store_location_id) {
        return (a.product?.sequence_number || 0) - (b.product?.sequence_number || 0);
      }
      const shelfOrder = { top: 1, middle: 2, bottom: 3 };
      return shelfOrder[a.product?.shelf_height || 'bottom'] - shelfOrder[b.product?.shelf_height || 'bottom'];
    }
    // Default alphabetical sorting
    return (a.product?.name || '').localeCompare(b.product?.name || '');
  });

  const statusIcons = {
    required: null,
    bought: <Check className="w-5 h-5 text-green-500" />,
    unavailable: <X className="w-5 h-5 text-red-500" />
  };

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.product?.name}</h3>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => updateQuantity(item, -1)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-gray-900 dark:text-gray-100">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item, 1)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {viewMode === 'shop' && item.product?.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.product.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {item.max_price && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">${item.max_price}</span>
              </div>
            )}
            <div className="flex gap-1">
              {Object.entries(statusIcons).map(([status, icon]) => (
                <button
                  key={status}
                  onClick={() => updateItemStatus(item.id, status as WeeklyShopItem['status'])}
                  className={`p-2 rounded-full ${
                    item.status === status
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};