import { useRef, useEffect, useState } from 'react';
import ARButton from './ARButton';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GltfViewer = ({ modelPath }) => {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // Track if view is changed from default
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default camera position (looking down and to the side)
  const defaultCameraPos = { x: -1.5, y: 2.3, z: 2.1 };
  const defaultTarget = { x: 0, y: 0, z: 0 };

  // Continuous rotation on mouse hold
  const rotateIntervalRef = useRef(null);
  const isRotatingRef = useRef(false);

  const startRotate = (direction = 1) => {
    if (isRotatingRef.current) return;
    isRotatingRef.current = true;
    const model = modelRef.current;
    if (!model) return;
    const step = (Math.PI / 180) * 1; // 1 degree per frame
    function animate() {
      if (!isRotatingRef.current || !model) return;
      model.rotation.y += direction * step;
      setIsChanged(true);
      rotateIntervalRef.current = requestAnimationFrame(animate);
    }
    animate();
  };

  const stopRotate = () => {
    isRotatingRef.current = false;
    if (rotateIntervalRef.current) {
      cancelAnimationFrame(rotateIntervalRef.current);
      rotateIntervalRef.current = null;
    }
  };

  const handleReset = () => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
    if (controlsRef.current) {
      // Temporarily disable controls to prevent 'change' event
      controlsRef.current.enabled = false;
      controlsRef.current.target.set(defaultTarget.x, defaultTarget.y, defaultTarget.z);
      controlsRef.current.update();
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);
      cameraRef.current.lookAt(defaultTarget.x, defaultTarget.y, defaultTarget.z);
    }
    setIsChanged(false);
    // Re-enable controls on next animation frame
    requestAnimationFrame(() => {
      if (controlsRef.current) controlsRef.current.enabled = true;
    });
  };


  // Track dark mode and update on color scheme change
  const [isDark, setIsDark] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDark(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Use the actual container width for responsive sizing
    const getContainerWidth = () => {
      if (mountRef.current) {
        return Math.min(mountRef.current.offsetWidth, 600);
      }
      return Math.min(window.innerWidth * 0.98, 600);
    };
    let width = getContainerWidth();
    let height = width * 2 / 3;

    // Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(isDark ? 0x23272b : 0xffffff, 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = 'auto';
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true; // Allow panning to move camera side to side
    controls.enablePan = true;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    // Remap mouse buttons: middle = pan, right = rotate
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controlsRef.current = controls;

    // Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add a front-facing directional light
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.7);
    frontLight.position.set(0, 0.5, 3); // In front of the model, slightly above
    scene.add(frontLight);

    // Add Grid Helper (dark mode: dark grid, light lines)
    const gridColor = isDark ? 0x44474a : 0x888888;
    const lineColor = isDark ? 0xbbbbbb : 0xcccccc;
    const gridHelper = new THREE.GridHelper(10, 20, gridColor, lineColor);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Add Ground Plane (dark mode: darkish grey)
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: isDark ? 0x23272b : 0xf8f8f8, roughness: 1, metalness: 0 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    plane.receiveShadow = true;
    scene.add(plane);

    // Load GLTF Model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        setLoading(false);
        // Center the model and place it above the grid
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        gltf.scene.position.sub(center); // Center at origin
        // Raise model so its bottom sits on the grid
        const height = box.max.y - box.min.y;
        gltf.scene.position.y += height / 2;
        scene.add(gltf.scene);
        modelRef.current = gltf.scene;
        // Set controls target to origin
        controls.target.set(0, 0, 0);
        controls.update();
        setIsChanged(false); // Reset state on new model
        // Attach OrbitControls change event, but ignore the first event after load
        let firstChange = true;
        const handleControlsChange = () => {
          if (firstChange) {
            firstChange = false;
            return;
          }
          // Check if camera or controls' target or model rotation is not default
          const cam = camera;
          const tgt = controls.target;
          const rot = gltf.scene.rotation;
          const cameraMoved =
            Math.abs(cam.position.x - defaultCameraPos.x) > 1e-3 ||
            Math.abs(cam.position.y - defaultCameraPos.y) > 1e-3 ||
            Math.abs(cam.position.z - defaultCameraPos.z) > 1e-3;
          const targetMoved =
            Math.abs(tgt.x - defaultTarget.x) > 1e-3 ||
            Math.abs(tgt.y - defaultTarget.y) > 1e-3 ||
            Math.abs(tgt.z - defaultTarget.z) > 1e-3;
          const rotated = Math.abs(rot.x) > 1e-3 || Math.abs(rot.y) > 1e-3 || Math.abs(rot.z) > 1e-3;
          setIsChanged(cameraMoved || targetMoved || rotated);
        };
        controls.addEventListener('change', handleControlsChange);
        // Clean up event listener when modelPath changes or component unmounts
        modelRef.current._cleanupControlsChange = () => {
          controls.removeEventListener('change', handleControlsChange);
        };
        console.log(gltf);
      },
      (xhr) => {
        setLoading(true);
      },
      (error) => {
        setLoading(false);
        console.error('An error occurred loading the model:', error);
      }
    );

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resizing
    const handleResize = () => {
      const width = getContainerWidth();
      const height = width * 2 / 3;
      camera.aspect = width / height;
      camera.fov = 75;
      camera.position.z = defaultCameraPos.z;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = 'auto';
    };
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      if (modelRef.current && modelRef.current._cleanupControlsChange) {
        modelRef.current._cleanupControlsChange();
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [modelPath, isDark]); // Re-run effect if modelPath or dark mode changes

  // Reset view when modelPath changes
  useEffect(() => {
    handleReset();
  }, [modelPath]);

  // Only show icons if window is narrow
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 480 : false);
  useEffect(() => {
    const handleResizeNarrow = () => setIsNarrow(window.innerWidth < 480);
    window.addEventListener('resize', handleResizeNarrow);
    return () => window.removeEventListener('resize', handleResizeNarrow);
  }, []);

  return (
    <div className="viewer-container">
      <div
        ref={mountRef}
        style={{
          width: '100%',
          maxWidth: '100%',
          aspectRatio: '3/2',
          height: 'auto',
          minHeight: 120,
          border: '2px solid #333',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          background: isDark ? '#23272b' : '#fff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <ARButton modelPath={modelPath} isDark={isDark} />
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          background: isDark ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: '5px solid #ccc',
              borderTop: '5px solid #646cff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: isNarrow ? 6 : '1rem',
            padding: isNarrow ? '0.5rem 0' : '1rem 0',
            background: isDark ? 'rgba(40,40,40,0.85)' : 'rgba(255,255,255,0.7)',
            borderTop: isDark ? '1px solid #333' : '1px solid #eee',
            zIndex: 1,
          }}
        >
          <button
            onMouseDown={() => startRotate(1)}
            onMouseUp={stopRotate}
            onMouseLeave={stopRotate}
            onTouchStart={() => startRotate(1)}
            onTouchEnd={stopRotate}
            style={{ minWidth: 40, minHeight: 40, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Rotate Left"
          >
            <span role="img" aria-label="Rotate Left" style={{ userSelect: 'none' }}>⟲</span>
            {!isNarrow && <span style={{ marginLeft: 6, userSelect: 'none' }}>Rotate Left</span>}
          </button>
          <button
            onClick={handleReset}
            style={{ visibility: isChanged ? 'visible' : 'hidden', minWidth: 40, minHeight: 40, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Reset View"
          >
            <span role="img" aria-label="Reset" style={{ userSelect: 'none' }}>🔄</span>
            {!isNarrow && <span style={{ marginLeft: 6, userSelect: 'none' }}>Reset View</span>}
          </button>
          <button
            onMouseDown={() => startRotate(-1)}
            onMouseUp={stopRotate}
            onMouseLeave={stopRotate}
            onTouchStart={() => startRotate(-1)}
            onTouchEnd={stopRotate}
            style={{ minWidth: 40, minHeight: 40, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Rotate Right"
          >
            <span role="img" aria-label="Rotate Right" style={{ userSelect: 'none' }}>⟳</span>
            {!isNarrow && <span style={{ marginLeft: 6, userSelect: 'none' }}>Rotate Right</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GltfViewer;

