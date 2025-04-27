// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// middleware.ts
// middleware.ts
export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    
    response.headers.set(
      "Access-Control-Allow-Origin",
      request.headers.get("origin") || "http://65.20.72.49"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  
    return response;
  }