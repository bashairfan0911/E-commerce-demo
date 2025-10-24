import React, { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api';

function Products({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts(selectedCategory === 'All' ? null : selectedCategory);
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(['All', ...response.data]);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async (category = null) => {
    setLoading(true);
    try {
      console.log('Fetching products...', category);
      const response = await getProducts(category);
      console.log('Products response:', response.data);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load products', err);
      setError(err.response?.data?.error || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  
  if (error) {
    return (
      <div className="container">
        <h2>Products</h2>
        <div className="error">Error: {error}</div>
        <button onClick={loadProducts}>Retry</button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container">
        <h2>Products</h2>
        <p>No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Products</h2>
      
      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedCategory === category 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255, 255, 255, 0.95)',
              color: selectedCategory === category ? 'white' : '#333',
              border: selectedCategory === category ? 'none' : '2px solid #e0e0e0',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: selectedCategory === category 
                ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                : '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '1rem'
                }}
              />
            )}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="price">${product.price}</div>
            <p style={{ color: product.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: '600' }}>
              {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
            </p>
            <button onClick={() => onAddToCart(product)} disabled={product.stock === 0}>
              {product.stock > 0 ? '🛒 Add to Cart' : '❌ Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
