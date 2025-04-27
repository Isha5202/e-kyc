"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers"; // ✅ built-in cookies helper
import { NextResponse } from "next/server";
import { JWTPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

export async function createJWT(user: {
  id: number;
  email: string;
  role: string;
}) {
  console.log("[createJWT] Called with:", user); // Already present

  console.log("[createJWT] Encoding JWT with secret key...");
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  console.log("[createJWT] Token generated successfully:", token); // Already present
  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  console.log("[verifyJWT] Called with token:", token);

  try {
    console.log("[verifyJWT] Verifying token...");
    const { payload } = await jwtVerify(token, secretKey);
    console.log("[verifyJWT] Token verified. Payload:", payload);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("[verifyJWT] Token verification failed:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return null;
  }
}

export async function setAuthCookie(token: string) {
        const cookieOptions = {
                httpOnly: true,
                secure: false, // ← Disable for HTTP
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 1 week
                sameSite: "lax" as const, // ← Use "lax" instead of "none"
         };

        console.log("[setAuthCookie] Options:", cookieOptions);
        (await cookies()).set("token", token, cookieOptions);
}

// Remove cookie using cookies().delete
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  const exists = cookieStore.has("token");

  if (exists) {
    console.log(
      "[removeAuthCookie] Token cookie exists. Proceeding to delete.",
    );
    cookieStore.delete("token");
    console.log("[removeAuthCookie] Token cookie deleted.");
  } else {
    console.log("[removeAuthCookie] No token cookie to delete.");
  }
}

// Get cookie using cookies().get
export async function getTokenFromCookies(): Promise<string | null> {
  console.log("[getTokenFromCookies] Checking for auth token in cookies...");

  try {
    const cookieStore = await cookies(); // <- only call once
    const hasToken = cookieStore.has("token");

    if (hasToken) {
      const token = cookieStore.get("token")?.value;
      console.log("[getTokenFromCookies] Token found in cookies:", token);
      return token ?? null;
    } else {
      console.log("[getTokenFromCookies] Cookie 'token' not found.");
      return null;
    }
  } catch (error) {
    console.error(
      "[getTokenFromCookies] Error occurred while accessing cookies:",
      error,
    );
    return null;
  }
}
