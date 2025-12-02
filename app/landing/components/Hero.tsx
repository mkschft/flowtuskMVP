"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Hero() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;
    
    setIsSubmitting(true);
    // Redirect to app with URL parameter
    const encodedUrl = encodeURIComponent(websiteUrl.trim());
    router.push(`/app?url=${encodedUrl}`);
  };

  const exampleUrls = [
    { label: "https://taxstar.app", url: "taxstar.app" },
    { label: "https://stripe.com", url: "stripe.com" },
    { label: "https://linear.app", url: "linear.app" },
  ];

  const handleExampleClick = (url: string) => {
    setWebsiteUrl(url);
    setIsSubmitting(true);
    const encodedUrl = encodeURIComponent(url);
    router.push(`/app?url=${encodedUrl}`);
  };

  return (
    <section className="relative overflow-hidden bg-white min-h-[90vh] flex items-center py-20">
      {/* Subtle Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/20 pointer-events-none" />
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] -translate-y-1/2 translate-x-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] translate-y-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      {/* Floating badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up">
        <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium text-gray-700">✨ AI-powered brand strategy</span>
          </div>
        </div>
      </div>

      <div className="px-8 mx-auto md:px-12 lg:px-24 max-w-7xl relative w-full z-10">
        <div className="max-w-4xl text-center mx-auto lg:text-balance mb-12 animate-fade-in-up">
          <h1 className="text-5xl leading-tight tracking-tight font-semibold text-base-900 hero-title-glow">
            AI brand agent that builds your brand in minutes not weeks
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mt-8 text-base-700 font-medium max-w-3xl mx-auto">
            Get agency-quality brand strategy in 10 minutes. From personas to messaging to launch-ready content.
          </p>

          {/* URL Input Section - Matching /app styling */}
          <div className="mt-12 max-w-2xl mx-auto px-4">
            {/* Enhanced Glow effect behind input - Similar to the reference */}
            <div className="relative">
              {/* Outer glow - warm purple gradient */}
              <div 
                className="absolute -inset-8 rounded-[3rem] opacity-60 group-hover:opacity-80 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ 
                  background: 'radial-gradient(ellipse 140% 100% at 50% 50%, rgba(168, 85, 247, 0.35) 0%, rgba(147, 51, 234, 0.25) 30%, rgba(236, 72, 153, 0.15) 60%, transparent 100%)',
                  filter: 'blur(60px)'
                }}
              />
              {/* Middle glow - brighter purple */}
              <div 
                className="absolute -inset-5 rounded-[2.5rem] opacity-70 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ 
                  background: 'radial-gradient(ellipse 120% 80% at 50% 50%, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%)',
                  filter: 'blur(40px)'
                }}
              />
              {/* Inner glow - brightest, tight to input */}
              <div 
                className="absolute -inset-3 rounded-[2.5rem] opacity-40 group-focus-within:opacity-70 transition-opacity duration-300 pointer-events-none"
                style={{ 
                  background: 'radial-gradient(ellipse 110% 70% at 50% 50%, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.15) 40%, transparent 70%)',
                  filter: 'blur(20px)'
                }}
              />
            
            <form onSubmit={handleSubmit} className="relative w-full mb-12 group">
              <div className="relative w-full rounded-3xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm p-3 sm:p-4 shadow-lg focus-within:border-[#8b5cf6] focus-within:shadow-2xl transition-all hover:shadow-xl">
                <Input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="Paste any website URL (e.g., https://yoursite.com)..."
                  disabled={isSubmitting}
                  className="!border-0 !ring-0 !outline-0 rounded-none pr-14 sm:pr-16 focus-visible:!ring-0 focus-visible:!outline-0 focus:!ring-0 focus:!outline-0 active:!ring-0 active:!outline-0 shadow-none bg-transparent text-base sm:text-lg h-12 sm:h-14 text-left [&:focus]:ring-0 [&:focus-visible]:ring-0"
                />
                <button
                  type="submit"
                  disabled={!websiteUrl.trim() || isSubmitting}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d28d9] hover:to-[#7c3aed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Analyze website"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </form>
            </div>

            {/* Example URLs */}
            <p className="text-sm text-gray-500 text-center mb-4 relative">
              Try these examples or paste any public website URL:
            </p>
            <div className="flex flex-wrap justify-center gap-3 relative">
              {exampleUrls.map((example) => (
                <button
                  key={example.url}
                  onClick={() => handleExampleClick(example.url)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full hover:border-[#8b5cf6] hover:bg-purple-50 hover:text-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {example.label}
                </button>
              ))}
            </div>

            {/* Social Proof / Quick Stats */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {/* Avatar circles with small person icons */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className="font-medium text-gray-700">100+ brands created</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium text-gray-700">10 min average</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-700">No credit card</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
