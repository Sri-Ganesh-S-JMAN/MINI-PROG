/**
 * Authentication utilities for getting the current user from JWT cookies
 */

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN" | "MANAGER";
  roleId: number;
}

// Map roleId to role name
const ROLE_MAP: Record<number, "USER" | "AGENT" | "ADMIN" | "MANAGER"> = {
  1: "USER",      // Regular employee
  4: "ADMIN",     // Administrator
  5: "AGENT",     // IT Support Agent
  6: "MANAGER",   // Manager
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: number;
      name: string;    // ✅ From JWT
      email: string;   // ✅ From JWT
      iat: number;
      exp: number;
    };

    const roleName = ROLE_MAP[decoded.role] || "USER";

    return {
      userId: decoded.id.toString(),
      name: decoded.name,
      email: decoded.email,
      role: roleName,
      roleId: decoded.role,
    };

  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.userId ?? null;
}