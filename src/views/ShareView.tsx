import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WeeklyShop } from '../types';
import { jsPDF } from 'jspdf';
import { FileDown, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareView = () => {
  const [currentShop, setCurrentShop] = useState<WeeklyShop | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const generatePDF = () => {
    if (!currentShop) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFontSize(20);
    doc.text('Shopping List', pageWidth / 2, margin, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date(currentShop.shop_date).toLocaleDateString()}`,
      pageWidth / 2,
      margin + 10,
      { align: 'center' }
    );

    let y = margin + 20;
    const lineHeight = 7;

    const groupedItems = currentShop.items.reduce((acc, item) => {
      const locationName = item.product?.location?.name || 'Other';
      if (!acc[locationName]) acc[locationName] = [];
      acc[locationName].push(item);
      return acc;
    }, {} as Record<string, typeof currentShop.items>);

    Object.entries(groupedItems).forEach(([location, items]) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(location, margin, y);
      y += lineHeight;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      items.forEach(item => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        
        const text = `□ ${item.product?.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`;
        doc.text(text, margin + 5, y);
        y += lineHeight;
      });

      y += lineHeight;
    });

    doc.save('shopping-list.pdf');
  };

  const shareList = async () => {
    if (!currentShop) return;

    const listUrl = `${window.location.origin}/list`;

    try {
      await navigator.share({
        title: 'Shopping List',
        text: `Shopping List for ${new Date(currentShop.shop_date).toLocaleDateString()}`,
        url: listUrl
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.origin + '/list');
      toast.success('List URL copied to clipboard');
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
        <Share2 className="w-12 h-12 mx-auto text-gray-400" />
        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No active shopping list</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new shopping list to share
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Share Shopping List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={generatePDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FileDown className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={shareList}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Share2 className="w-5 h-5" />
            Share List
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Preview</h2>
        <div className="space-y-4">
          {Object.entries(
            currentShop.items.reduce((acc, item) => {
              const locationName = item.product?.location?.name || 'Other';
              if (!acc[locationName]) acc[locationName] = [];
              acc[locationName].push(item);
              return acc;
            }, {} as Record<string, typeof currentShop.items>)
          ).map(([location, items]) => (
            <div key={location}>
              <h3 className="font-medium text-lg mb-2 text-gray-900 dark:text-gray-100">{location}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <span>•</span>
                    <span>{item.product?.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        x{item.quantity}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareView;