import { useState } from 'react'
import './App.css'
import GltfViewer from './components/GltfViewer.jsx';

function App() {

  return (
    <>
      <div className="card">
      </div>
      <GltfViewer modelPath="/assets/bookshelf/scene.gltf" />

    </>
  )
}

export default App
