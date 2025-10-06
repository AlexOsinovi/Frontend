import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import ProfileViewPage from './pages/ProfileViewPage';
import ProfileEditPage from './pages/ProfileEditPage';
import OrdersPage from './pages/OrdersPage';
import CardsPage from './pages/CardsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="container"><div className="alert alert-info">Loading...</div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg mb-4 theme-navbar">
      <div className="container">
        <Link className="navbar-brand fw-semibold d-flex align-items-center gap-2" to="/">
          <i className="bi bi-bag"></i>
          <span>Shop</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
          </ul>
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item me-3 d-flex align-items-center">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/profile"><i className="bi bi-person"></i> Profile</Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/orders"><i className="bi bi-receipt"></i> Orders</Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/cards"><i className="bi bi-credit-card"></i> Cards</Link>
                </li>
                <li className="nav-item me-3">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/cart"><i className="bi bi-cart3"></i> Cart ({cartCount})</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={logout}><i className="bi bi-box-arrow-right"></i> Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfileViewPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <PrivateRoute>
                    <ProfileEditPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <ProductsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <CartPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-success"
                element={
                  <PrivateRoute>
                    <OrderSuccessPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <OrdersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cards"
                element={
                  <PrivateRoute>
                    <CardsPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <button
            type="button"
            className="btn btn-primary position-fixed"
            style={{ right: 16, bottom: 16, zIndex: 1050 }}
            onClick={() => {
              const root = document.documentElement;
              if (root.classList.contains('theme-dark')) {
                root.classList.remove('theme-dark');
                try { localStorage.setItem('THEME', 'light'); } catch {}
              } else {
                root.classList.add('theme-dark');
                try { localStorage.setItem('THEME', 'dark'); } catch {}
              }
            }}
            title="Toggle theme"
          >
            <i className="bi bi-moon-stars"></i>
          </button>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
