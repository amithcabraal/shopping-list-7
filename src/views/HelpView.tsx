import React from 'react';
import { Book, Search, ShoppingCart, Settings, Share2 } from 'lucide-react';

const HelpView = () => {
  const sections = [
    {
      icon: Search,
      title: 'Creating Your List',
      content: [
        'Use the search bar to find products',
        'Click the plus icon to add items to your list',
        'Use voice search by clicking the microphone icon',
        'Specify quantities and special instructions for each item'
      ]
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Mode',
      content: [
        'Items are sorted by store location for efficient shopping',
        'Mark items as bought or unavailable',
        'View item locations and shelf positions',
        'Track your shopping progress'
      ]
    },
    {
      icon: Settings,
      title: 'Managing Products',
      content: [
        'Add new products in the Admin section',
        'Specify store locations and shelf positions',
        'Set typical prices and notes',
        'Edit or remove existing products'
      ]
    },
    {
      icon: Share2,
      title: 'Sharing Your List',
      content: [
        'Download your list as a PDF',
        'Share your list with others',
        'View a preview of your list before sharing',
        'Lists are organized by store sections'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Book className="w-12 h-12 mx-auto text-blue-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          How to Use the Shopping List App
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Get started with our easy-to-use shopping list manager
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map(({ icon: Icon, title, content }) => (
          <div
            key={title}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h2>
            </div>
            <ul className="space-y-2">
              {content.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-gray-800/50 p-6 rounded-lg">
        <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Need More Help?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          This app is designed to make your shopping experience easier and more
          organized. If you have any questions or suggestions, please don't
          hesitate to reach out to our support team.
        </p>
      </div>
    </div>
  );
};

export default HelpView;