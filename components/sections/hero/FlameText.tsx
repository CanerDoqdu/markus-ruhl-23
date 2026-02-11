"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function FlameText() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    import("three").then((THREE) => {
      const container = containerRef.current!

      // Scene setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 10

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth * 0.7, 280)
      renderer.setClearColor(0x0a0c13, 0)
      
      container.innerHTML = ""
      container.appendChild(renderer.domElement)

      // Create text canvas
      const canvas = document.createElement("canvas")
      canvas.width = 1400
      canvas.height = 280
      const ctx = canvas.getContext("2d")!
      
      ctx.fillStyle = "rgba(0, 0, 0, 0)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.font = "bold 180px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("MASS MONSTER", 700, 140)

      const textTexture = new THREE.CanvasTexture(canvas)
      textTexture.minFilter = THREE.LinearFilter
      textTexture.magFilter = THREE.LinearFilter

      // Clean white text shader
      const vertexShader = `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `

      const fragmentShader = `
        uniform sampler2D textTexture;
        varying vec2 vUv;

        void main() {
          vec4 texColor = texture2D(textTexture, vUv);
          float textAlpha = texColor.r;
          
          if (textAlpha < 0.3) discard;
          
          vec3 color = vec3(1.0, 1.0, 1.0);
          
          gl_FragColor = vec4(color, textAlpha);
        }
      `

      const material = new THREE.ShaderMaterial({
        uniforms: {
          textTexture: { value: textTexture }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      })

      const geometry = new THREE.PlaneGeometry(14, 2.8)
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      let frameCount = 0
      const animate = () => {
        frameCount++
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }

      const animationId = requestAnimationFrame(animate)

      const handleResize = () => {
        const width = window.innerWidth * 0.7
        renderer.setSize(width, 280)
        camera.aspect = width / 280
        camera.updateProjectionMatrix()
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        cancelAnimationFrame(animationId)
        try {
          geometry.dispose()
          material.dispose()
          renderer.dispose()
          textTexture.dispose()
          container.removeChild(renderer.domElement)
        } catch (e) {}
      }
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="flex flex-col items-center justify-center w-full"
    >
      <div ref={containerRef} className="w-full flex justify-center" />
      
      <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-light tracking-wide mt-6">
        bodybuilders who ever lived.
      </p>
    </motion.div>
  )
}
