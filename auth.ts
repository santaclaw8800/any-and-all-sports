import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/api/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      // Pass user ID to session if needed
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
