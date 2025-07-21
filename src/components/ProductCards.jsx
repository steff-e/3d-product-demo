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
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
        width: '100%',
        marginTop: '2.5rem',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductCards;

