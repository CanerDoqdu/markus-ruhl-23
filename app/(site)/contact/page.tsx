import type { Metadata } from "next"
import Heading from "@/components/shared/Heading"
import ScrollProgress from "@/components/motion/ScrollProgress"
import Reveal from "@/components/motion/Reveal"
import ContactForm from "@/components/sections/contact/ContactForm"
import { SOCIAL_LINKS } from "@/lib/constants"
import StaggerContainer, { StaggerItem } from "@/components/motion/StaggerContainer"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Markus Rühl. Inquiries about training, collaborations, or general questions.",
}

const CONTACT_INFO = [
  {
    icon: "📧",
    title: "Email",
    description: "For general inquiries",
    value: "contact@markusruhl.com",
  },
  {
    icon: "📍",
    title: "Location",
    description: "Based in",
    value: "Darmstadt, Germany",
  },
  {
    icon: "💼",
    title: "Business",
    description: "For partnerships",
    value: "business@markusruhl.com",
  },
  {
    icon: "🌐",
    title: "Social",
    description: "Follow the journey",
    value: "Multiple platforms",
  },
]

export default function ContactPage() {
  return (
    <>
      <ScrollProgress />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-main via-yellow/10 to-main px-6 pt-32">
          <Reveal className="text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
              <span className="text-white">GET IN</span>
              <br />
              <span className="text-yellow glow-text-yellow">TOUCH</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Questions about training programs, collaborations, or general inquiries?
              We'd love to hear from you.
            </p>
          </Reveal>
        </section>

        {/* Contact Methods */}
        <section className="relative py-32 px-6 bg-main">
          <div className="max-w-6xl mx-auto">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {CONTACT_INFO.map((info) => (
                <StaggerItem key={info.title}>
                  <div className="p-6 border border-gray-800 rounded-xl bg-gradient-to-br from-blue/5 to-transparent hover:border-yellow/50 transition-all duration-300 text-center">
                    <div className="text-4xl mb-4">{info.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {info.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">{info.description}</p>
                    <p className="text-yellow font-semibold text-sm">{info.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Contact Form */}
        <ContactForm />

        {/* Social Links */}
        <section className="relative py-32 px-6 bg-gradient-to-b from-main to-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <Heading className="text-center mb-12">
                CONNECT
              </Heading>
              <p className="text-gray-400 text-lg mb-12">
                Follow the journey across social platforms
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex gap-6 justify-center">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow to-blue flex items-center justify-center hover:shadow-glow-yellow transition-all hover:scale-110"
                    aria-label={social.name}
                  >
                    <span className="text-main text-xl font-bold">
                      {social.icon.charAt(0).toUpperCase()}
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  )
}
