import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Routes that REQUIRE authentication (no guest access)
  // /copilot requires login to access the brand canvas
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/copilot") ||
    request.nextUrl.pathname.startsWith("/protected") ||
    request.nextUrl.pathname.startsWith("/gallery");

  // Routes that allow guest access (try before signup)
  // /app allows guests to experience the product
  const isGuestAllowedRoute =
    request.nextUrl.pathname.startsWith("/app");

  // Auth pages that should redirect to /app if already logged in
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up");

  // If trying to access protected route without auth, redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    // Preserve the intended destination for redirect after login
    url.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Guest-allowed routes (/app) don't need authentication
  // Let them through regardless of auth status

  // If authenticated user trying to access auth pages, redirect to /app
  if (isAuthPage && user) {
    // Check if there's a redirectTo param and honor it
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const url = request.nextUrl.clone();
    url.pathname = redirectTo || "/app";
    url.search = ""; // Clear search params
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|opengraph-image.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

