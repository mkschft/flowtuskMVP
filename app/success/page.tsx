"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Flowtusk Pro! 🎉
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Your payment was successful. You now have access to all premium features.
            </p>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-lg mb-4">What's next?</h2>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                  <span>Start analyzing unlimited websites</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                  <span>Export your ICP cards to PDF, Figma, or Webflow</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                  <span>Access advanced insights and priority support</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d32d1] hover:to-[#7c3aed]"
                >
                  Start Analyzing
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Receipt sent to your email • Session ID: {sessionId?.slice(0, 20)}...
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

