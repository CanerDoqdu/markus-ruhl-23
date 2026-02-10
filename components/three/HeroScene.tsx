"use client"

import { useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import * as THREE from "three"

// Simple 3D dumbbell shape
function DumbbellShape() {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Dumbbell bars */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 3, 32]} />
          <meshStandardMaterial color="#5867B6" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Left weight */}
        <mesh position={[0, -1.7, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 32]} />
          <meshStandardMaterial color="#FFFF92" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Right weight */}
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 32]} />
          <meshStandardMaterial color="#FFFF92" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <spotLight
          position={[-10, -10, -10]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#5867B6"
        />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#FFFF92" />

        <DumbbellShape />
      </Canvas>
    </div>
  )
}
