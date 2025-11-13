"use client";

import { useState, useEffect } from "react";
import { CompactPersonaCard } from "@/components/CompactPersonaCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock data - you'll replace this with real data from your DB
const galleryCards = [
  {
    company: "Stripe",
    url: "stripe.com",
    thumbnail: "/gallery/stripe-icp.png",
  },
  {
    company: "Notion",
    url: "notion.so",
    thumbnail: "/gallery/notion-icp.png",
  },
  {
    company: "Linear",
    url: "linear.app",
    thumbnail: "/gallery/linear-icp.png",
  },
  {
    company: "Figma",
    url: "figma.com",
    thumbnail: "/gallery/figma-icp.png",
  },
  {
    company: "Webflow",
    url: "webflow.com",
    thumbnail: "/gallery/webflow-icp.png",
  },
  {
    company: "Airtable",
    url: "airtable.com",
    thumbnail: "/gallery/airtable-icp.png",
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ICP Card Gallery
            </h1>
            <p className="text-lg text-gray-600">
              Explore ICP analyses from famous companies. Click any card to see the full analysis.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryCards.map((card) => (
              <Link
                key={card.url}
                href={`/app?url=${encodeURIComponent(card.url)}`}
                className="block hover:scale-105 transition-transform"
              >
                <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-100 hover:border-purple-300">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-2xl font-bold text-purple-600">{card.company}</p>
                  </div>
                  <h3 className="font-semibold text-lg">{card.company}</h3>
                  <p className="text-sm text-gray-600">{card.url}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
              <h2 className="text-2xl font-bold mb-4">Analyze Your Competitor</h2>
              <p className="text-gray-600 mb-6">
                See who they're targeting and how you can compete
              </p>
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d32d1] hover:to-[#7c3aed]"
                >
                  Try It Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

