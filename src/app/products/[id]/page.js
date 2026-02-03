'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data - replace with actual data fetching
const getProduct = (id) => {
  const products = {
    1: { id: 1, name: 'Product 1', price: 29.99, description: 'This is a great product with amazing features.', image: '/placeholder.jpg' },
    2: { id: 2, name: 'Product 2', price: 39.99, description: 'Another excellent product for your needs.', image: '/placeholder.jpg' },
    3: { id: 3, name: 'Product 3', price: 49.99, description: 'Premium quality product with advanced features.', image: '/placeholder.jpg' },
    4: { id: 4, name: 'Product 4', price: 59.99, description: 'Top-tier product for professional use.', image: '/placeholder.jpg' },
  };
  return products[id];
};

export default function ProductDetail({ params }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const product = getProduct(params.id);

  if (!product) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add to cart logic here
    alert(`Added ${quantity} ${product.name}(s) to cart!`);
    router.push('/cart');
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '400px'}}>
            <span className="text-muted">Product Image</span>
          </div>
        </div>
        <div className="col-md-6">
          <h1 className="mb-3">{product.name}</h1>
          <p className="text-primary fs-3 fw-bold mb-3">${product.price}</p>
          <p className="mb-4">{product.description}</p>
          
          <div className="mb-3">
            <label htmlFor="quantity" className="form-label">Quantity:</label>
            <select 
              id="quantity"
              className="form-select w-auto d-inline-block"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn btn-primary btn-lg me-3"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <button className="btn btn-outline-secondary btn-lg">
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}