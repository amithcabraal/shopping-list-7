import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Weekly Shop');
  const location = useLocation();

  const menuItems = [
    { path: '/list', label: 'List View' },
    { path: '/shop', label: 'Shopping View' },
    { path: '/products', label: 'Product Admin' },
    { path: '/locations', label: 'Location Admin' },
    { path: '/share', label: 'Share' },
    { path: '/print', label: 'Print List' },
    { path: '/help', label: 'How to Use' },
  ];

  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    setPageTitle(`Weekly Shop${currentItem ? ` - ${currentItem.label}` : ''}`);
  }, [location.pathname]);

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">
                {pageTitle}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <nav className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
            <div className="flex-1 overflow-y-auto pt-16">
              <div className="px-4 space-y-2">
                {menuItems.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      isCurrentPath(path)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}