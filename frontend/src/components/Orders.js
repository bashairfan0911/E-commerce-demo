import React, { useState, useEffect } from 'react';
import { getUserOrders, cancelOrder } from '../api';

function Orders({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = async () => {
    try {
      const response = await getUserOrders(userId);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId);
      alert('✅ Order cancelled successfully!');
      // Reload orders to reflect the change
      loadOrders();
    } catch (err) {
      console.error('Failed to cancel order', err);
      const errorMsg = err.response?.data?.error || 'Failed to cancel order';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) return (
    <div className="container">
      <h2>My Orders</h2>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '3rem', 
        borderRadius: '20px', 
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <p style={{ color: '#666', fontSize: '1.2rem', marginTop: '1rem' }}>Loading orders...</p>
      </div>
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="container">
        <h2>My Orders</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '3rem', 
          borderRadius: '20px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ color: '#666', fontSize: '1.5rem' }}>No orders yet</h3>
          <p style={{ color: '#999', marginTop: '0.5rem' }}>Start shopping to see your orders here!</p>
        </div>
      </div>
    );
  }

  const getStatusEmoji = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      default: return '📦';
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'processing': return '#3498db';
      case 'shipped': return '#9b59b6';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const canCancelOrder = (status) => {
    return status.toLowerCase() === 'pending';
  };

  return (
    <div className="container">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Order #{order.id}</h3>
            <span style={{ 
              background: getStatusColor(order.status),
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {getStatusEmoji(order.status)} {order.status.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '1.1rem' }}>
              <strong>Total:</strong> <span style={{ 
                color: '#667eea', 
                fontSize: '1.3rem', 
                fontWeight: '700' 
              }}>${order.total_amount}</span>
            </p>
            <p style={{ fontSize: '1.1rem' }}>
              <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {order.shipping_address && (
            <div style={{
              background: 'rgba(102, 126, 234, 0.1)',
              padding: '1rem',
              borderRadius: '10px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>📦 Shipping Address</h4>
              <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                <strong>{order.shipping_name}</strong><br />
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
                {order.shipping_country}<br />
                📞 {order.shipping_phone}
              </p>
            </div>
          )}
          {canCancelOrder(order.status) && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              disabled={cancellingOrderId === order.id}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: cancellingOrderId === order.id ? '#ccc' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: cancellingOrderId === order.id ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: cancellingOrderId === order.id ? 'none' : '0 4px 15px rgba(245, 87, 108, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {cancellingOrderId === order.id ? '⏳ Cancelling...' : '❌ Cancel Order'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Orders;
