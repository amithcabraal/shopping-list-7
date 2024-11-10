import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WeeklyShop } from '../types';
import { Printer } from 'lucide-react';

const PrintView = () => {
  const [currentShop, setCurrentShop] = useState<WeeklyShop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force light mode for print view
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    // Restore original theme when component unmounts
    return () => {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    };
  }, []);

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
        console.error('Error fetching shop data:', error);
        return;
      }

      setCurrentShop(shopData);
      setLoading(false);
    };

    fetchCurrentShop();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentShop || !currentShop.items.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">No items in current shopping list</h2>
      </div>
    );
  }

  // Group items by location
  const groupedItems = currentShop.items.reduce((acc, item) => {
    const locationName = item.product?.location?.name || 'Other';
    if (!acc[locationName]) acc[locationName] = [];
    acc[locationName].push(item);
    return acc;
  }, {} as Record<string, typeof currentShop.items>);

  // Sort items within each location by sequence number
  Object.values(groupedItems).forEach(items => {
    items.sort((a, b) => (a.product?.sequence_number || 0) - (b.product?.sequence_number || 0));
  });

  return (
    <div className="bg-white text-gray-900">
      {/* Print Controls - hidden when printing */}
      <div className="print:hidden mb-6">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Printer className="w-5 h-5" />
          Print Shopping List
        </button>
      </div>

      {/* Print Layout */}
      <div className="print:block">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-600">
            {new Date(currentShop.shop_date).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 print:text-sm">
          {Object.entries(groupedItems).map(([location, items], index) => (
            <div key={location} className={index % 2 === 0 ? 'break-inside-avoid' : ''}>
              <h2 className="font-bold text-lg mb-2 border-b pb-1 text-gray-900">{location}</h2>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="print:border-2 print:border-black"
                    />
                    <span className="flex-1 text-gray-900">{item.product?.name}</span>
                    <span className="text-gray-600">
                      Qty: {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;