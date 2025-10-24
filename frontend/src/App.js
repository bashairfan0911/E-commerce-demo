import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Profile from './components/Profile';
import './App.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (token && userId) {
      setUser({ id: userId, name: userName, token });
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogin = (userData) => {
    const userObj = {
      id: userData.userId,
      name: userData.name,
      token: userData.token
    };
    setUser(userObj);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('userName', userData.name);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('cart');
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <nav className="navbar">
            <h1>E-Commerce Store</h1>
            <div className="nav-links">
              {user ? (
                <>
                  <Link to="/products">Products</Link>
                  <Link to="/cart">Cart ({cart.length})</Link>
                  <Link to="/orders">Orders</Link>
                  <Link to="/profile">Profile</Link>
                  <span>Hello, {user.name}</span>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </nav>

          <Routes>
            <Route path="/login" element={user ? <Navigate to="/products" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={user ? <Navigate to="/products" /> : <Register />} />
            <Route path="/products" element={user ? <Products onAddToCart={addToCart} /> : <Navigate to="/login" />} />
            <Route path="/cart" element={user ? <Cart cart={cart} setCart={setCart} userId={user?.id} /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={user ? <Checkout cart={cart} setCart={setCart} userId={user?.id} /> : <Navigate to="/login" />} />
            <Route path="/orders" element={user ? <Orders userId={user?.id} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile userId={user?.id} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/products" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
