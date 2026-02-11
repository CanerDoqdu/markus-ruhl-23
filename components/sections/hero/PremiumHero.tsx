"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Button from "@/components/shared/Button"
import useMediaQuery from "@/hooks/useMediaQuery"

// Keep existing Kinect hologram (unchanged)
const KinectHologram = ({ onReady }: { onReady?: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    import("three").then((THREE) => {
      const container = containerRef.current!
      const video = videoRef.current!

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
      
      const rect = container.getBoundingClientRect()
      renderer.setSize(rect.width || window.innerWidth, rect.height || window.innerHeight)
      renderer.setClearColor(0x0a0c13, 0)
      
      renderer.domElement.style.position = "absolute"
      renderer.domElement.style.top = "0"
      renderer.domElement.style.left = "0"
      container.appendChild(renderer.domElement)

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

          float lumaMask = smoothstep(0.20, 0.80, luminance);
          float satMask = smoothstep(0.03, 0.30, saturation);
          float alpha = lumaMask * satMask;

          float isWhite = step(0.92, luminance) * (1.0 - step(0.1, saturation));
          if (isWhite > 0.5) discard;
          if (alpha < 0.03) discard;

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

      const animate = () => {
        requestAnimationFrame(animate)
        camera.lookAt(center)
        renderer.render(scene, camera)
      }

      video.play().catch(() => {})

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

// Premium feature card component
const StatLine = ({ label, value, delay }: { label: string; value: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-center justify-end gap-4"
  >
    <div className="flex items-center gap-2">
      <motion.div
        className="h-[1px] bg-gradient-to-r from-transparent to-[#FFFF92]/40"
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      />
      <div className="w-1.5 h-1.5 bg-[#FFFF92]/60 rotate-45" />
    </div>
    <div className="text-right">
      <p className="text-[#FFFF92] text-xs font-mono uppercase tracking-[0.2em]">{value}</p>
      <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">{label}</p>
    </div>
  </motion.div>
)

export default function PremiumHero() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [isHologramReady, setIsHologramReady] = useState(false)

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-[#0a0c13]">
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFF92]/5 via-transparent to-[#5867B6]/5" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#FFFF92]/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#5867B6]/10 via-transparent to-transparent" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,146,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,146,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Hologram in center */}
      {isDesktop && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-4xl">
            <KinectHologram onReady={() => setIsHologramReady(true)} />
          </div>
        </div>
      )}

      {!isDesktop && (
        <div className="absolute inset-0">
          <Image
            src="/assets/images/markus-ruhl-bodybuilder-wallpaper-17.jpg"
            alt="Markus Rühl"
            fill
            className="object-cover opacity-40"
            quality={85}
          />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 h-full flex items-end pb-24 lg:pb-32 px-6 lg:px-12 pt-24">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            
            {/* Left side - Main heading (bottom-left like ChainGPT) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-left space-y-4 lg:col-span-1"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em]"
              >
                UNLEASH THE POWER OF
              </motion.p>

              <div>
                <h1 className="text-6xl lg:text-8xl font-black leading-[0.9]">
                  <span className="block bg-gradient-to-r from-[#FFFF92] via-[#FFD700] to-[#FFFF92] bg-clip-text text-transparent">
                    Mass
                  </span>
                  <span className="block bg-gradient-to-r from-[#5867B6] via-[#7B8BD9] to-[#5867B6] bg-clip-text text-transparent">
                    Monster
                  </span>
                </h1>
              </div>

              <p className="text-gray-500 text-sm max-w-sm leading-relaxed font-light">
                One of the biggest bodybuilders who ever lived.
                IFBB Professional, dominating the stage since 1990.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button href="#aboutus">
                  DISCOVER LEGEND
                </Button>
              </motion.div>
            </motion.div>

            {/* Center - Hologram space */}
            <div className="hidden lg:block" />

            {/* Right side - ChainGPT style animated lines */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex flex-col gap-6 items-end"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-2 mb-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#FFFF92] animate-pulse" />
                <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">Career Stats</p>
              </motion.div>

              <StatLine label="Years Pro" value="14 YEARS" delay={0.6} />
              <StatLine label="Stage Weight" value="129.5 KG" delay={0.7} />
              <StatLine label="Off-Season" value="148 KG" delay={0.8} />
              <StatLine label="Competitions" value="50+ SHOWS" delay={0.9} />
              <StatLine label="Mass Increase" value="171%" delay={1.0} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mt-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFFF92] to-[#FFD700] flex items-center justify-center text-black font-black text-sm">
                  MR
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xs">Markus Rühl</p>
                  <p className="text-gray-600 text-[10px] font-mono">IFBB PROFESSIONAL</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Scroll</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-[#FFFF92]/30 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-[#FFFF92]" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
