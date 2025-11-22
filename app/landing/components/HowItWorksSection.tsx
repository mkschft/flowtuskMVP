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

          {/* Right Side: Visual Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-12 min-h-[500px] flex items-center justify-center border border-base-200/50">
              <div className="text-center">
                <div className="relative mx-auto mb-6">
                  {/* Central Element */}
                  <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center border-2 border-purple-200 relative z-10">
                    <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  
                  {/* Concentric Circles */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full border-2 border-dashed border-purple-200/50"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-80 h-80 rounded-full border-2 border-dashed border-purple-200/30"></div>
                  </div>

                  {/* Peripheral Icons */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-purple-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13l4-4 4 4M3 17l4-4 4 4M13 3h6v6M13 21h6v-6" />
                    </svg>
                  </div>
                  <div className="absolute top-1/4 right-0 translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-purple-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-purple-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-purple-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-purple-200">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <span className="text-base-400 text-sm font-medium">Visual Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
