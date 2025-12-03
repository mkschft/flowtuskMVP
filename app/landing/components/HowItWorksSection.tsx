export function HowItWorksSection() {
  return (
    <section className="py-24 bg-white">
      <div className="px-8 mx-auto md:px-12 lg:px-24 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Text Content */}
          <div>
            <p className="text-sm leading-normal font-bold uppercase text-accent-600 mb-4">
              HOW IT WORKS
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-900 mb-6">
              Skip the manual process
            </h2>
            <p className="text-lg text-base-600 mb-8 leading-relaxed">
              Get agency-quality brand strategy in minutes, not weeks. Flowtusk analyzes your market, creates detailed personas, and generates launch-ready content—all powered by AI. No endless research or manual work required.
            </p>
            
            {/* Key Benefits List */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base text-base-600">
                  AI-powered personas based on real market data and insights
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base text-base-600">
                  Complete brand strategy with positioning and messaging in 10 minutes
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base text-base-600">
                  Launch-ready content tailored to each persona—emails, social posts, and more
                </p>
              </li>
            </ul>

            {/* CTA Button */}
            <a
              href="https://calendar.app.google/fVMLbGtD9LWPeoTL9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center focus:ring-2 focus:outline-none focus:ring-purple-500/50 h-11 px-6 py-3 text-base font-semibold text-white rounded-full transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}>
              Book a Demo
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Right Side: Persona Generation Illustration */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="/flowtusk_illustration_01_persona_generation.png"
                alt="Flowtusk persona generation process illustration"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
