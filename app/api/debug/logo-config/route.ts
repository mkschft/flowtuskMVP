import { NextResponse } from "next/server";
import { shouldGenerateLogos } from "@/lib/generation/logo-generator";

export async function GET() {
  const config = {
    featureEnabled: shouldGenerateLogos(),
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    stockimgKeyExists: !!process.env.STOCKIMG_API_KEY,
    openaiKeyPreview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    stockimgKeyPreview: process.env.STOCKIMG_API_KEY ? `${process.env.STOCKIMG_API_KEY.substring(0, 10)}...` : 'NOT SET',
    envValue: process.env.NEXT_PUBLIC_ENABLE_LOGO_GENERATION || 'not set (defaults to true)',
  };

  return NextResponse.json(config, { status: 200 });
}

