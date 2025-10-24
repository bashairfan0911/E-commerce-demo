import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api';

function Checkout({ cart, setCart, userId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: ''
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('User ID:', userId);
    console.log('Cart:', cart);
    console.log('Shipping Info:', shippingInfo);
    
    if (!userId) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      navigate('/products');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: parseInt(userId),
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        shipping: {
          name: shippingInfo.name.trim(),
          address: shippingInfo.address.trim(),
          city: shippingInfo.city.trim(),
          state: shippingInfo.state.trim(),
          zip: shippingInfo.zip.trim(),
          country: shippingInfo.country.trim(),
          phone: shippingInfo.phone.trim()
        }
      };
      
      console.log('Placing order with data:', JSON.stringify(orderData, null, 2));
      const response = await createOrder(orderData);
      console.log('Order response:', response.data);
      
      setCart([]);
      alert(`✅ Order placed successfully!\n\nOrder ID: ${response.data.orderId}\nTotal: $${response.data.totalAmount}\n\nYour order will be shipped to:\n${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`);
      navigate('/orders');
    } catch (err) {
      console.error('Checkout error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to place order';
      alert(`❌ Error: ${errorMsg}\n\nPlease check the browser console (F12) for more details.`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <h2>Checkout</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ color: '#666', fontSize: '1.5rem' }}>Your cart is empty</h3>
          <button 
            onClick={() => navigate('/products')}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Checkout</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Shipping Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Shipping Address</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={shippingInfo.name}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.9rem',
                marginBottom: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '1rem'
              }}
            />
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={shippingInfo.address}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.9rem',
                marginBottom: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '1rem'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={shippingInfo.city}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={shippingInfo.state}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <input
                type="text"
                name="zip"
                placeholder="ZIP Code"
                value={shippingInfo.zip}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={shippingInfo.country}
                onChange={handleInputChange}
                required
                style={{
                  padding: '0.9rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shippingInfo.phone}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.9rem',
                marginTop: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '1.5rem',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? '⏳ Processing...' : '✓ Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{item.name}</div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: '600', color: '#667eea' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '2px solid #e0e0e0'
            }}>
              <h3 style={{ color: '#333' }}>Total:</h3>
              <h3 style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2rem'
              }}>
                ${total.toFixed(2)}
              </h3>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '1.5rem',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Secure Checkout</h4>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Your payment information is encrypted and secure. We never store your credit card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
