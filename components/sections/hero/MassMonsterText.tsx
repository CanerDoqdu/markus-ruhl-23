"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

// Simplex/Perlin-like noise function
const noise = (x: number, y: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

const perlin = (x: number, y: number) => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi

  const n00 = noise(xi, yi)
  const n10 = noise(xi + 1, yi)
  const n01 = noise(xi, yi + 1)
  const n11 = noise(xi + 1, yi + 1)

  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)

  const nx0 = n00 * (1 - u) + n10 * u
  const nx1 = n01 * (1 - u) + n11 * u
  return nx0 * (1 - v) + nx1 * v
}

export default function MassMonsterText() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    canvas.width = 600
    canvas.height = 350

    let animationFrameId: number
    let time = 0

    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Create multiple flame columns
      const flamePositions = [
        centerX - 100,
        centerX - 50,
        centerX,
        centerX + 50,
        centerX + 100,
      ]

      flamePositions.forEach((flameX, idx) => {
        // Draw flame using shader-like logic
        const flameWidth = 60
        const flameHeight = 200

        const imageData = ctx.createImageData(flameWidth, flameHeight)
        const data = imageData.data

        for (let py = 0; py < flameHeight; py++) {
          for (let px = 0; px < flameWidth; px++) {
            // Normalize UV
            let u = px / flameWidth
            let v = py / flameHeight

            // Spherize-like effect
            u = u * 2 - 1
            v = v * 2 - 1
            const len = Math.sqrt(u * u + v * v)
            u = (u / (len + 0.5)) * 0.6 + 0.2
            v = (v / (len + 0.5)) * 0.6 + 0.2

            // Stretch effect
            u = Math.abs(u) ** 1 * Math.sign(u)
            v = Math.abs(v) ** 3 * Math.sign(v)

            u = u * 2 - 0.5
            v = v * 2 - 0

            // Perlin noise distortion
            const perlinUv1 = perlin(u * 2, v * 2 - time) - 0.5
            u += perlinUv1 * 0.5

            // Gradient effects
            const grad1 = Math.sin(time * 10 - v * Math.PI * 2 * 2)
            const grad2 = v <= 1 ? v : 1
            const grad3 = 1 - v <= 1 ? 1 - v : 0

            u += grad1 * grad2 * 0.2

            // Displaced perlin noise
            const dispPerlin1 = perlin(u * 2, v * 2 - time * 0.25) - 0.5
            const dispPerlin2 = perlin(
              u * 2 + dispPerlin1,
              v * 2 - time * 0.5 + dispPerlin1
            ) - 0.5

            u += dispPerlin2 * 0.5

            // Cellular noise
            const cellU = u + -v * 1.5 - time * 1.5
            const cellV = v
            const cellular =
              1 - noise((cellU % 1) * 2, (cellV % 1) * 2)
            const cellSmooth = cellular >= 0.25 ? 1 : 0

            // Shape calculation
            const shapeInput = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2)
            let shape = shapeInput <= 0.5 ? 1 : 0
            shape *= cellSmooth
            shape *= grad3 >= 0 ? grad3 : 0
            shape = shape >= 0.01 ? 1 : 0

            // Output: white (255, 255, 255) with shape alpha
            const idx4 = (py * flameWidth + px) * 4
            data[idx4] = 255 // R
            data[idx4 + 1] = 255 // G
            data[idx4 + 2] = 255 // B
            data[idx4 + 3] = shape * 255 // A
          }
        }

        ctx.putImageData(imageData, flameX - flameWidth / 2, centerY - 90)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative flex flex-col items-center justify-center"
    >
      <div className="relative w-full flex justify-center">
        {/* Flame canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "auto",
            aspectRatio: "600/350",
          }}
        />

        {/* Text content - on top of flames */}
        <div className="relative z-20 text-center max-w-lg px-4 pt-8">
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 font-light tracking-wide">
            one of the biggest
          </p>

          {/* MASS MONSTER - highlighted and bright */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mb-4"
          >
            <h3 className="text-5xl sm:text-6xl font-black tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
              MASS MONSTER
            </h3>
          </motion.div>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-light tracking-wide">
            bodybuilders who ever lived.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
