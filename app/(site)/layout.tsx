import type { Metadata } from "next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { SITE_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Home",
  description: SITE_CONFIG.description,
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
