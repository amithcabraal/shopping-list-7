import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ListView from './views/ListView';
import ShopView from './views/ShopView';
import ProductAdminView from './views/ProductAdminView';
import LocationAdminView from './views/LocationAdminView';
import HelpView from './views/HelpView';
import ShareView from './views/ShareView';
import PrintView from './views/PrintView';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route path="/list" element={<ListView />} />
            <Route path="/shop" element={<ShopView />} />
            <Route path="/products" element={<ProductAdminView />} />
            <Route path="/locations" element={<LocationAdminView />} />
            <Route path="/help" element={<HelpView />} />
            <Route path="/share" element={<ShareView />} />
            <Route path="/print" element={<PrintView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;