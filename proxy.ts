import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Demo mode bypass for public access
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
  
  // Allow demo routes without authentication
  if (request.nextUrl.pathname.startsWith('/demo')) {
    const { NextResponse } = await import("next/server");
    return NextResponse.next();
  }
  
  // Allow demo mode for /app route if enabled
  if (isDemoMode && request.nextUrl.pathname.startsWith('/app')) {
    // Let demo users through without auth
    return updateSession(request);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
