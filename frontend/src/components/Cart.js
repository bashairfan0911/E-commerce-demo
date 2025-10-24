import React from 'react';
import { useNavigate } from 'react-router-dom';

function Cart({ cart, setCart }) {
  const navigate = useNavigate();

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const removeItem = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container">
        <h2>Shopping Cart</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ color: '#666', fontSize: '1.5rem' }}>Your cart is empty</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Shopping Cart</h2>
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '10px'
                }}
              />
            )}
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{item.name}</h3>
              <p style={{ color: '#666' }}>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => updateQuantity(item.id, -1)}>−</button>
            <span style={{ 
              margin: '0 0.5rem', 
              fontWeight: '600', 
              fontSize: '1.2rem',
              minWidth: '30px',
              textAlign: 'center'
            }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
            <button onClick={() => removeItem(item.id)}>
              🗑️ Remove
            </button>
          </div>
        </div>
      ))}
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
        <button onClick={() => navigate('/checkout')}>
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}

export default Cart;
