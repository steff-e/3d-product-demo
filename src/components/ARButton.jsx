import React from 'react';

function ARButton({ modelPath, isDark }) {
  // Derive .usdz and .glb paths from modelPath
  let usdzPath = modelPath;
  let glbPath = modelPath;
  if (modelPath.endsWith('.gltf')) {
    usdzPath = modelPath.replace(/\.gltf$/, '.usdz');
    glbPath = modelPath.replace(/\.gltf$/, '.glb');
  } else if (modelPath.endsWith('.glb')) {
    usdzPath = modelPath.replace(/\.glb$/, '.usdz');
    glbPath = modelPath;
  }

  let href = modelPath;
  let target = '_blank';
  if (typeof window !== 'undefined') {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      href = usdzPath + (usdzPath.includes('?') ? '&' : '?') + 'allowsContentScaling=0';
      target = undefined;
    } else if (/Android/.test(ua)) {
      href = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbPath)}&mode=ar_preferred&resizable=false`;
      target = undefined;
    }
  }

  const arButtonStyle = {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    background: isDark ? 'rgba(40,40,40,0.95)' : 'rgba(255,255,255,0.95)',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '0.4rem 0.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    textDecoration: 'none',
    color: isDark ? '#fff' : '#222',
    fontWeight: 500,
    fontSize: 15,
    transition: 'box-shadow 0.2s',
  };

  return (
    <a
      href={href}
      rel="noopener noreferrer"
      {...(target ? { target } : {})}
      style={arButtonStyle}
      title="View in AR"
      aria-label="View in AR"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#646cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
      <span style={{ marginLeft: 4 }}>View in AR</span>
    </a>
  );
}

export default ARButton;
