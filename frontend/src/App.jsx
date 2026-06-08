import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home          from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Profile    from './pages/Profile';
import Cart       from './pages/Cart';
import Wishlist   from './pages/Wishlist';
import Checkout   from './pages/Checkout';
import ProductForm    from './pages/ProductForm';
import CategoryForm   from './pages/CategoryForm';

import { useAuth } from './hooks/useAuth';

// Proteção de rotas
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.tipoAcesso !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
              <Routes>
                {/* Públicas */}
                <Route path="/"          element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />

                {/* Autenticadas */}
                <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/cart"      element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/wishlist"  element={<PrivateRoute><Wishlist /></PrivateRoute>} />
                <Route path="/checkout"  element={<PrivateRoute><Checkout /></PrivateRoute>} />

                {/* Admin */}
                <Route path="/admin/products"          element={<AdminRoute><ProductForm /></AdminRoute>} />
                <Route path="/admin/products/:id/edit" element={<AdminRoute><ProductForm /></AdminRoute>} />
                <Route path="/admin/categories"        element={<AdminRoute><CategoryForm /></AdminRoute>} />

                {/* 404 */}
                <Route path="*" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">404 — Página não encontrada</h2></div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
