"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Button from "@/components/shared/Button"
import useMediaQuery from "@/hooks/useMediaQuery"

// Three.js Kinect hologram with depth shader
const KinectHologram = ({ onReady }: { onReady?: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    import("three").then((THREE) => {
      const container = containerRef.current!
      const video = videoRef.current!

      // Scene setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        10000
      )
      camera.position.set(0, 0, 500)

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      
      // Set size to container, not full window
      const rect = container.getBoundingClientRect()
      renderer.setSize(rect.width || window.innerWidth, rect.height || window.innerHeight)
      renderer.setClearColor(0x0a0c13, 1)
      
      renderer.domElement.style.position = "absolute"
      renderer.domElement.style.top = "0"
      renderer.domElement.style.left = "0"
      container.appendChild(renderer.domElement)

      // Video texture with highest quality settings
      const texture = new THREE.VideoTexture(video)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.format = THREE.RGBAFormat
      texture.generateMipmaps = false
      texture.needsUpdate = true

      const width = 320
      const height = 240
      const nearClipping = 850
      const farClipping = 4000

      // Create geometry
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array(width * height * 3)
      for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
        vertices[i] = j % width
        vertices[i + 1] = Math.floor(j / width)
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

      const vertexShader = `
        uniform sampler2D map;
        uniform float width;
        uniform float height;
        uniform float nearClipping, farClipping;
        uniform float pointSize;
        uniform float zOffset;
        varying vec2 vUv;

        const float XtoZ = 1.11146;
        const float YtoZ = 0.83359;

        void main() {
          vUv = vec2( position.x / width, position.y / height );
          vec4 color = texture2D( map, vUv );
          float depth = ( color.r + color.g + color.b ) / 3.0;

          float z = ( 1.0 - depth ) * (farClipping - nearClipping) + nearClipping;

          vec4 pos = vec4(
            ( position.x / width - 0.5 ) * z * XtoZ,
            ( position.y / height - 0.5 ) * z * YtoZ,
            - z + zOffset,
            1.0);

          gl_PointSize = pointSize;
          gl_Position = projectionMatrix * modelViewMatrix * pos;
        }
      `

      const fragmentShader = `
        uniform sampler2D map;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D( map, vUv );
          float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          float maxc = max(max(color.r, color.g), color.b);
          float minc = min(min(color.r, color.g), color.b);
          float saturation = maxc - minc;

          // Enhanced masking for better quality
          float lumaMask = smoothstep(0.20, 0.80, luminance);
          float satMask = smoothstep(0.03, 0.30, saturation);
          float alpha = lumaMask * satMask;

          // Remove very bright white regions
          float isWhite = step(0.92, luminance) * (1.0 - step(0.1, saturation));
          if (isWhite > 0.5) discard;
          if (alpha < 0.03) discard;

          // Enhanced yellow tint with better brightness
          vec3 tint = vec3(1.0, 1.0, 0.0);
          float enhancedLuminance = pow(luminance, 0.85);
          gl_FragColor = vec4(tint * enhancedLuminance, alpha * 0.95);
        }
      `

      const material = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: texture },
          width: { value: width },
          height: { value: height },
          nearClipping: { value: nearClipping },
          farClipping: { value: farClipping },
          pointSize: { value: 6 },
          zOffset: { value: 1000 },
        },
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      })

      const mesh = new THREE.Points(geometry, material)
      scene.add(mesh)

      const center = new THREE.Vector3(0, 0, -1000)

      // Animation loop - smooth 60fps rendering
      const animate = () => {
        requestAnimationFrame(animate)
        camera.lookAt(center)
        renderer.render(scene, camera)
      }

      video.play().catch(() => {
        console.log("Video autoplay prevented")
      })

      animate()
      onReady?.()

      const handleResize = () => {
        const rect = container.getBoundingClientRect()
        const width = rect.width || window.innerWidth
        const height = rect.height || window.innerHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        try {
          container.removeChild(renderer.domElement)
        } catch (e) {}
        geometry.dispose()
        material.dispose()
        renderer.dispose()
      }
    })
  }, [onReady])

  return (
    <>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        style={{ display: "none" }}
      >
        <source src="/assets/markus-assest/videos/marcusVideo.mp4" type="video/mp4" />
      </video>
    </>
  )
}

export default function Hero() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [isHologramReady, setIsHologramReady] = useState(false)

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-main">
      {isDesktop && (
        <div className="absolute inset-0">
          <KinectHologram onReady={() => setIsHologramReady(true)} />
        </div>
      )}

      {!isDesktop && (
        <div className="absolute inset-0">
          <Image
            src="/assets/images/markus-ruhl-bodybuilder-wallpaper-17.jpg"
            alt="Markus Rühl"
            fill
            className="object-cover"
            quality={85}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-radial-dark" />

      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <div className="mb-8 flex flex-col items-center lg:items-start gap-4">
                <Image
                  src="/assets/MARKUS.svg"
                  alt="MARKUS"
                  width={400}
                  height={100}
                  className="w-full max-w-md h-auto drop-shadow-2xl"
                  priority
                />
                <Image
                  src="/assets/RUHL.svg"
                  alt="RUHL"
                  width={400}
                  height={80}
                  className="w-full max-w-md h-auto drop-shadow-2xl"
                />
              </div>

              <p className="text-gray-300 text-lg mb-8 max-w-lg leading-relaxed">
                IFBB Professional, legendary bodybuilder, and fitness icon. <br />
                Dominating the stage since 1990.
              </p>

              <Button href="#aboutus">DISCOVER LEGEND</Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex flex-col items-center justify-center"
            >
              <p className="text-lg text-white font-bold text-center" style={{ fontFamily: 'Arial, sans-serif' }}>
                one of the biggest "mass monster" <br />
                bodybuilders who ever lived.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
