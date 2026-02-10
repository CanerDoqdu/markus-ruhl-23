"use client"

import { motion } from "framer-motion"
import Button from "@/components/shared/Button"
import { SOCIAL_LINKS } from "@/lib/constants"

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-main via-blue/10 to-main overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,103,182,0.15),transparent_70%)] animate-pulse" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
            <span className="text-white">JOIN THE</span>
            <br />
            <span className="text-yellow glow-text-yellow">LEGACY</span>
          </h2>

          <p className="text-gray-400 text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with the community. Stay updated on training insights, 
            events, and the journey that never stops.
          </p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex gap-6 justify-center mb-12 flex-wrap"
          >
            {SOCIAL_LINKS.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow to-blue flex items-center justify-center hover:shadow-glow-yellow transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <span className="text-main text-xl font-bold">
                  {social.icon.charAt(0).toUpperCase()}
                </span>
              </motion.a>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button href="/contact" variant="primary" className="text-lg px-12 py-4">
              Get In Touch
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
