import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center, OrbitControls, MeshTransmissionMaterial, useFBO } from '@react-three/drei'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import './App.css'




function CustomEnvironment({ isDarkMode }: { isDarkMode: boolean }) {
  const { viewport } = useThree()

  return (
    <group>
      <mesh position={[0, 0, -15]} scale={[viewport.width * 6, viewport.height * 6, 1]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color={isDarkMode ? '#000000' : '#ffffff'} />
      </mesh>
      <mesh position={[0, 20, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[viewport.width * 6, viewport.height * 6, 1]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color={isDarkMode ? '#000000' : '#ffffff'} />
      </mesh>
    </group>
  )
}

function TextGrid({ isDarkMode, text, textSize, rowSpacing, colSpacing, xOffset, yOffset }: { 
  isDarkMode: boolean, 
  text: string,
  textSize: number,
  rowSpacing: number,
  colSpacing: number,
  xOffset: number,
  yOffset: number
}) {
  const { viewport } = useThree()
  const rows = 10
  const cols = 20
  console.log(rows, cols);

  return (
    <group position={[xOffset, yOffset, 0]} renderOrder={-1}>
      {Array.from({ length: rows }).map((_, i) =>
        Array.from({ length: cols }).map((_, j) => (
          <Text3D
            key={`${i}-${j}`}
            position={[
              (j - (cols - 1) / 2) * colSpacing,
              (i - (rows - 1) / 2) * rowSpacing,
              0
            ]}
            scale={[textSize, textSize, 0.1]}
            font="/fonts/helvetiker_regular.typeface.json"
          >
            {text}
            <meshBasicMaterial 
              color={isDarkMode ? '#ffffff' : '#000000'}
            />
          </Text3D>
        ))
      )}
    </group>
  )
}

function BackgroundContent({ isDarkMode, text, textSize, rowSpacing, colSpacing, xOffset, yOffset }: { 
  isDarkMode: boolean, 
  text: string,
  textSize: number,
  rowSpacing: number,
  colSpacing: number,
  xOffset: number,
  yOffset: number
}) {
  return (
    <>
      <TextGrid 
        isDarkMode={isDarkMode} 
        text={text} 
        textSize={textSize}
        rowSpacing={rowSpacing}
        colSpacing={colSpacing}
        xOffset={xOffset}
        yOffset={yOffset}
      />
      <CustomEnvironment isDarkMode={isDarkMode} />
    </>
  )
}

function Scene({ isDarkMode, distortion, text, textSize, rowSpacing, colSpacing, xOffset, yOffset }: { 
  isDarkMode: boolean, 
  distortion: number, 
  text: string,
  textSize: number,
  rowSpacing: number,
  colSpacing: number,
  xOffset: number,
  yOffset: number
}) {
  const { gl, camera, viewport } = useThree()

  useEffect(() => {
    const handleResize = () => {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      perspectiveCamera.updateProjectionMatrix();
    };
  
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [camera]);

  const bgRef = useRef<THREE.Group>(null)

  const shapeScale = useMemo(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    const fovRadians = (perspectiveCamera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(fovRadians / 2) * perspectiveCamera.position.z;
    console.log(perspectiveCamera.position.z)
    return visibleHeight * 1.5;
  }, [camera.position.z, (camera as THREE.PerspectiveCamera).fov]);

  useFrame(({ scene }) => {
    gl.render(scene, camera)
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight intensity={0.5} />
      <group ref={bgRef}>
        <BackgroundContent 
          isDarkMode={isDarkMode} 
          text={text} 
          textSize={textSize}
          rowSpacing={rowSpacing}
          colSpacing={colSpacing}
          xOffset={xOffset}
          yOffset={yOffset}
        />
      </group>
      <Center>
        <mesh scale={shapeScale}>
          <dodecahedronGeometry args={[1, 3]} />
          <MeshTransmissionMaterial
            ior={3.2}
            thickness={0.1}
            anisotropicBlur={0.0}
            chromaticAberration={0.15}
            distortion={distortion}
            distortionScale={5.05}
            temporalDistortion={0.04}
            roughness={0.1}
            samples={6}
            resolution={512}
            transmission={1}
            
            
          />
        </mesh>
      </Center>
    </>
  )
}



function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [distortion, setDistortion] = useState(0.4)
  const [text, setText] = useState('ANTI')
  const [textSize, setTextSize] = useState(1.45)
  const [rowSpacing, setRowSpacing] = useState(3.3)
  const [colSpacing, setColSpacing] = useState(5.5)
  const [xOffset, setXOffset] = useState(0)
  const [yOffset, setYOffset] = useState(0)

  const toggleBackground = () => {
    setIsDarkMode(!isDarkMode)
  }

  const sliderStyle = {
    width: '150px',
    marginLeft: '10px'
  }

  const labelStyle = {
    color: isDarkMode ? 'white' : 'black',
    minWidth: '100px'
  }

  const valueStyle = {
    color: isDarkMode ? 'white' : 'black',
    minWidth: '40px'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: isDarkMode ? 'black' : 'white' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={toggleBackground}>
          Toggle Background
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="distortion" style={labelStyle}>Interference:</label>
          <input
            id="distortion"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={distortion}
            onChange={(e) => setDistortion(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueStyle}>{distortion.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="text" style={labelStyle}>Text:</label>
          <input
            id="text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ 
              width: '150px',
              padding: '5px',
              background: isDarkMode ? '#333' : '#fff',
              color: isDarkMode ? 'white' : 'black',
              border: `1px solid ${isDarkMode ? '#666' : '#ccc'}`,
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="textSize" style={labelStyle}>Text Size:</label>
          <input
            id="textSize"
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={textSize}
            onChange={(e) => setTextSize(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueStyle}>{textSize.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="rowSpacing" style={labelStyle}>Row Spacing:</label>
          <input
            id="rowSpacing"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={rowSpacing}
            onChange={(e) => setRowSpacing(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueStyle}>{rowSpacing.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="colSpacing" style={labelStyle}>Column Spacing:</label>
          <input
            id="colSpacing"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={colSpacing}
            onChange={(e) => setColSpacing(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueStyle}>{colSpacing.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="xOffset" style={labelStyle}>X Position:</label>
          <input
            id="xOffset"
            type="range"
            min="-20"
            max="20"
            step="0.1"
            value={xOffset}
            onChange={(e) => setXOffset(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueStyle}>{xOffset.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="yOffset" style={labelStyle}>Y Position:</label>
          <input
            id="yOffset"
            type="range"
            min="-20"
            max="20"
            step="0.1"
            value={yOffset}
            onChange={(e) => setYOffset(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueStyle}>{yOffset.toFixed(1)}</span>
        </div>
      </div>
      <Canvas 
        camera={{ 
          position: [0, 0, 60],
          fov: 7,
          near: 0.01,
          far: 5000,
        }}
        gl={{ 
          stencil: true,
          antialias: true,
          alpha: true
        }}
        onCreated={({ gl, camera, size }) => {
          gl.setClearColor(isDarkMode ? 'black' : 'white')
          gl.setClearColor(isDarkMode ? 'black' : 'white')

          const perspectiveCamera = camera as THREE.PerspectiveCamera
          perspectiveCamera.aspect = size.width / size.height
          perspectiveCamera.position.set(0, 0, 40)
        }}
      >
        <Scene 
          isDarkMode={isDarkMode} 
          distortion={distortion} 
          text={text}
          textSize={textSize}
          rowSpacing={rowSpacing}
          colSpacing={colSpacing}
          xOffset={xOffset}
          yOffset={yOffset}
        />
        {/* <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minDistance={2}
          maxDistance={20}
          rotateSpeed={0.1}
        /> */}
      </Canvas>
    </div>
  )
  
}

export default App
