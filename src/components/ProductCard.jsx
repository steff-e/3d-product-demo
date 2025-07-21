
import React from 'react';
import GltfViewer from './GltfViewer';

const ProductCard = ({ product }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 10,
        padding: 20,
        background: '#fafafa',
        width: '100%',
        maxWidth: 650,
        minWidth: 0,
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      <h2 style={{ margin: 0 }}>{product.name}</h2>
      <div style={{ fontStyle: 'italic', fontSize: '0.95em', color: '#555', marginBottom: 12 }}>{product.description}</div>
      <GltfViewer modelPath={product.modelSrc} />
    </div>
  );
};

export default ProductCard;

