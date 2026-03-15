// ============================================
// Teacher Auth Helper — Home Plus LMS
// ============================================
// Server-side helper to get the current teacher's ID.
// Used by all teacher-facing pages to scope data queries.
//
// In demo mode, returns a demo teacher ID so pages can
// render without a real auth session.

// Demo teacher ID used when no auth session is available.
// This allows the teacher dashboard to render with demo data
// during development without requiring Google sign-in.
const DEMO_TEACHER_ID = 'demo-teacher';

/**
 * Get the current teacher's ID from the server-side session.
 * Falls back to a demo teacher ID when no session is available.
 *
 * TODO: Replace with real NextAuth getServerSession() when auth is wired up.
 * The real implementation should:
 *   1. Call getServerSession(authOptions)
 *   2. Verify the user has role TEACHER
 *   3. Return the teacher's user ID
 *   4. Throw or redirect if not authenticated
 */
export async function getTeacherId(): Promise<string> {
  // Placeholder: in production, replace with session-based teacher identity.
  // For now, return a demo teacher ID so pages can render.
  return DEMO_TEACHER_ID;
}
