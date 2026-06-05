import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export async function getCurrentUser() {
    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) throw new AuthError("Token not found", 401);

    try {
        const decode = verifyToken(token);

        if (!decode) throw new AuthError("Invalid token", 401);

        return decode.userId;
    } catch (error: any) {
        // Handle expired or invalid JWT specifically
        if (error.name === "TokenExpiredError") {
            throw new AuthError("Session expired. Please log in again.", 401);
        }
        if (error.name === "JsonWebTokenError") {
            throw new AuthError("Invalid token. Please log in again.", 401);
        }
        if (error instanceof AuthError) throw error;
        throw new AuthError("Authentication failed", 401);
    }
}