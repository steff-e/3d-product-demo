import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const ProductCards = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('Products.json')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  return (
    <div className="product-cards-container">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductCards;