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
    <section className="relative overflow-hidden bg-white min-h-screen flex items-center">
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
      
      <div className="px-8 py-32 mx-auto md:px-12 lg:px-24 max-w-7xl relative w-full z-10">
        <div className="max-w-4xl text-center mx-auto lg:text-balance mb-12 animate-fade-in-up">
          <h1 className="text-5xl leading-tight tracking-tight font-semibold text-base-900 hero-title-glow">
            AI brand agent that builds your brand in minutes not weeks
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mt-6 text-base-700 font-medium max-w-3xl mx-auto">
            Get agency-quality brand strategy in 10 minutes. From personas to messaging to launch-ready content.
          </p>
          
          {/* URL Input Section - Matching /app styling */}
          <div className="mt-10 max-w-2xl mx-auto px-4">
            {/* Glow effect behind input */}
            <div className="relative">
              <div 
                className="absolute -inset-6 rounded-[3rem] opacity-40 group-hover:opacity-70 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ 
                  background: 'radial-gradient(ellipse 130% 90% at 50% 50%, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 80%)',
                  filter: 'blur(40px)'
                }}
              />
              <div 
                className="absolute -inset-3 rounded-[2.5rem] opacity-50 group-focus-within:opacity-80 transition-opacity duration-300 pointer-events-none"
                style={{ 
                  background: 'radial-gradient(ellipse 115% 75% at 50% 50%, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
                  filter: 'blur(25px)'
                }}
              />
            
            <form onSubmit={handleSubmit} className="relative w-full mb-6 group">
              <div className="relative w-full rounded-3xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm p-3 sm:p-4 shadow-lg focus-within:border-[#8b5cf6] focus-within:shadow-xl transition-all hover:shadow-xl">
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
            <p className="text-sm text-gray-500 text-center mb-3 relative">
              Try these examples or paste any public website URL:
            </p>
            <div className="flex flex-wrap justify-center gap-2 relative">
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
          </div>
        </div>
      </div>
    </section>
  );
}
