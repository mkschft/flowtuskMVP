import { NextResponse } from "next/server";
import { shouldGenerateLogos } from "@/lib/generation/logo-generator";

export async function GET() {
  const config = {
    featureEnabled: shouldGenerateLogos(),
    generationType: 'SVG text-based logos (programmatic)',
    envValue: process.env.NEXT_PUBLIC_ENABLE_LOGO_GENERATION || 'not set (defaults to true)',
  };

  return NextResponse.json(config, { status: 200 });
}

