"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") || "pro";
  const [loading, setLoading] = useState(false);

  const planDetails = {
    pro: {
      name: "Pro",
      price: "$29/month",
      features: [
        "Unlimited analyses",
        "PDF/Figma/Webflow export",
        "Remove watermark",
        "Advanced insights",
        "Priority support",
      ],
    },
    lifetime: {
      name: "Lifetime Deal",
      price: "$290 one-time",
      features: [
        "Everything in Pro",
        "Lifetime access",
        "Early adopter badge",
        "Influence roadmap",
        "Private Discord",
        "Future premium features",
      ],
    },
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.pro;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // Call your backend to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again or contact support.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{currentPlan.name}</h1>
              <p className="text-4xl font-bold text-purple-600">
                {currentPlan.price}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {currentPlan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d32d1] hover:to-[#7c3aed]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Purchase'
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              🔒 Secure checkout powered by Stripe
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                30-day money-back guarantee • Cancel anytime
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

