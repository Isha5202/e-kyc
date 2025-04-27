// src/lib/types.ts

export interface JWTPayload {
    id: number;
    email: string;
    role: string;
    iat?: number; // issued at (timestamp)
    exp?: number; // expiration (timestamp)
  }
  