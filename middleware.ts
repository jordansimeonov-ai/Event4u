import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  
  // Verify if we are on a custom domain/subdomain
  // 'localhost:3000' is for local dev
  const currentHost = hostname.replace(`:3000`, ""); 
  
  // Domains that should render the main site (Landing Page)
  const rootDomains = ["localhost", "event4u.bg", "www.event4u.bg"];
  
  if (rootDomains.includes(currentHost)) {
    // If we are on the root domain, we just let Next.js handle the route normally
    // typically mapping to app/page.tsx
    return NextResponse.next();
  }

  // If we are here, we are on a subdomain (e.g. starosel.event4u.bg)
  const subdomain = currentHost.split('.')[0];
  
  // Rewrite the path to /tenant/[subdomain]
  // This tells Next.js to render app/tenant/[subdomain]/page.tsx
  // preserving the original URL in the browser address bar.
  url.pathname = `/tenant/${subdomain}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}
