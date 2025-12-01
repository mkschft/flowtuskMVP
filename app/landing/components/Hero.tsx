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
    <section className="overflow-hidden bg-white min-h-screen flex items-center">
      <div className="px-8 py-32 mx-auto md:px-12 lg:px-24 max-w-7xl relative w-full">
        <div className="max-w-4xl text-center mx-auto lg:text-balance mb-12 animate-fade-in-up">
          <h1 className="text-5xl leading-tight tracking-tight font-semibold text-base-900 hero-title-glow">
            AI brand agent that builds your brand in minutes not weeks
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mt-6 text-base-700 font-medium max-w-3xl mx-auto">
            Get agency-quality brand strategy in 10 minutes. From personas to messaging to launch-ready content.
          </p>
          
          {/* URL Input Section - Matching /app styling */}
          <div className="mt-10 max-w-2xl mx-auto px-4">
            <form onSubmit={handleSubmit} className="relative w-full mb-6">
              <div className="relative w-full rounded-3xl border-2 border-gray-200 bg-white p-3 sm:p-4 shadow-lg focus-within:border-[#8b5cf6] focus-within:shadow-xl transition-all">
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
            
            {/* Example URLs */}
            <p className="text-sm text-gray-500 text-center mb-3">
              Try these examples or paste any public website URL:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleUrls.map((example) => (
                <button
                  key={example.url}
                  onClick={() => handleExampleClick(example.url)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-[#8b5cf6] hover:bg-purple-50 hover:text-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
