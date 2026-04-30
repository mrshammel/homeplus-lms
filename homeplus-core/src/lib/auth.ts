import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Demo sign-in - allows teacher/student access without Google OAuth
    CredentialsProvider({
      id: 'demo',
      name: 'Demo',
      credentials: {
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        const role = credentials?.role;
        if (role === 'TEACHER') {
          return { id: 'teacher-1', name: 'Mrs. Shammel', email: 'shammel@hpln.ca', image: null, role: 'TEACHER' } as any;
        }
        if (role === 'STUDENT') {
          return { id: 'student-1', name: 'Ava Chen', email: 'ava.chen@student.hpln.ca', image: null, role: 'STUDENT' } as any;
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, googleId: true, avatar: true },
        });

        if (!existingUser) {
          // Create new account — use role from authorize() response if available
          const newRole = (user as any).role || 'STUDENT';
          await prisma.user.create({
            data: {
              name: user.name || 'Student',
              email: user.email,
              googleId: account?.providerAccountId,
              role: newRole,
              avatar: user.image,
            },
          });
          console.log(`[Auth] Created new user: ${user.email} (${newRole})`);
        } else {
          // Update Google ID and avatar if not set
          if (!existingUser.googleId && account?.providerAccountId) {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                googleId: account.providerAccountId,
                avatar: user.image || existingUser.avatar,
              },
            });
          }
        }
      } catch (error: any) {
        // Log full error details but DON'T block sign-in
        console.error('[Auth] DB sync error (sign-in still allowed):', {
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
          email: user.email,
        });
      }

      // Always allow Google sign-in - DB issues shouldn't lock users out
      return true;
    },

    async jwt({ token, user }) {
      // Always re-fetch onboardingStatus from DB so a completed onboarding
      // is reflected immediately without requiring a full sign-out/sign-in.
      // On first sign-in we also pull role, gradeLevel, etc.
      const lookupEmail = user?.email || (token.email as string | undefined);
      if (lookupEmail) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: lookupEmail },
            select: { id: true, role: true, gradeLevel: true, onboardingStatus: true, onboardingStep: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.gradeLevel = dbUser.gradeLevel;
            // Always overwrite - this is the key fix for the stale-session bug
            token.onboardingStatus = dbUser.onboardingStatus;
            token.onboardingStep = dbUser.onboardingStep;
          } else if (user?.email) {
            // First sign-in but not in DB yet
            token.role = 'STUDENT';
            console.warn('[Auth] JWT: user not found in DB, defaulting to STUDENT:', user.email);
          }
        } catch (error: any) {
          if (user?.email) token.role = 'STUDENT';
          console.error('[Auth] JWT DB error:', error?.message);
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Pass role/id from token to session (no extra DB query)
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).gradeLevel = token.gradeLevel;
        (session.user as any).onboardingStatus = token.onboardingStatus;
        (session.user as any).onboardingStep = token.onboardingStep;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // After sign-in, redirect based on role
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + '/dashboard';
    },
  },

  pages: {
    signIn: '/',  // Use Home Plus landing as sign-in page
  },

  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
