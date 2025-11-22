"use client";

import { useState, useRef } from "react";

export function Hero() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
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
          <div className="flex flex-wrap items-center gap-3 justify-center mx-auto mt-10">
            <a
              href="https://calendar.app.google/fVMLbGtD9LWPeoTL9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center focus:ring-2 focus:outline-none focus:ring-purple-500/50 h-11 px-6 py-3 text-base font-semibold text-white rounded-full transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}>
              Book a Demo
            </a>
          </div>
        </div>
        
        {/* Video Player */}
        <div className="relative w-full mx-auto max-w-6xl items-center mt-20">
          {/* Gradient Glow Behind Video */}
          <div 
            className="absolute -inset-8 -z-10 rounded-3xl"
            style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(124, 58, 237, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)', filter: 'blur(60px)' }}
          />
          <div 
            className="absolute -inset-4 -z-10 rounded-3xl"
            style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(124, 58, 237, 0.3) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 80%)', filter: 'blur(40px)' }}
          />
          <div className="relative rounded-2xl shadow-2xl border border-base-200/50 overflow-hidden bg-black aspect-video z-0">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/dashboard.png"
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              <source src="/hero-video.mp4" type="video/mp4" />
              <source src="/hero-video.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
            
            {/* Play Button Overlay */}
            {!playing && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm cursor-pointer group hover:bg-black/30 transition-all z-10"
              >
                <button
                  onClick={handlePlay}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)' }}
                  aria-label="Play video"
                >
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
