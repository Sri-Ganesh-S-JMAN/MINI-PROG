/**
 * Authentication utilities for getting the current user
 * In a real app, this would validate session tokens/JWTs
 * For now, provides a mock implementation that works with the seed data
 */

export interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "AGENT" | "ADMIN";
}

export function getCurrentUser(): CurrentUser | null {
  // In a real NextAuth implementation, this would come from the session
  // For this implementation, we'll check for a header that can be set for testing
  // or use a simple mock for development
  
  // This is a placeholder - in production this would validate JWT/session
  // The API routes expect this to return user info or null
  
  // Mock user for development - can be overridden by headers in API calls
  return {
    userId: "1",
    name: "Test User",
    email: "test@example.com",
    role: "ADMIN",
  };
}

export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user?.userId ?? null;
}

