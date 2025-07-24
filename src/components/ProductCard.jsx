
import React from 'react';
import GltfViewer from './GltfViewer';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <h2 className="product-card-title">{product.name}</h2>
      <div className="product-card-description">{product.description}</div>
      <GltfViewer modelPath={product.modelSrc} />
    </div>
  );
};

export default ProductCard;