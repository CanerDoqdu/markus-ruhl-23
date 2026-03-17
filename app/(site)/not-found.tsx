import Link from "next/link"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-[80vh] flex items-center justify-center px-4"
    >
      <div className="max-w-lg w-full text-center">
        {/* 404 Typography */}
        <h1 className="text-[8rem] sm:text-[10rem] font-black font-raleway leading-none tracking-tighter mb-2">
          <span className="text-yellow">4</span>
          <span className="text-white/20">0</span>
          <span className="text-yellow">4</span>
        </h1>

        <h2 className="text-2xl font-bold text-white mb-4 font-raleway">
          Page Not Found
        </h2>

        <p className="text-gray-400 mb-10 leading-relaxed max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-yellow to-blue text-main font-bold rounded-lg hover:shadow-glow-yellow transition-shadow motion-reduce:transition-none text-center"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-yellow/50 hover:text-white transition-colors motion-reduce:transition-none text-center"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  )
}
