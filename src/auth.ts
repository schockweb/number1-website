import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.siteUser.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) return null;

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash,
                );

                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    company: user.company ?? undefined,
                    plan: user.plan,
                    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&bold=true`,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.company = (user as { company?: string }).company;
                token.plan = (user as { plan?: string }).plan;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as { company?: string }).company = token.company as string | undefined;
                (session.user as { plan?: string }).plan = token.plan as string | undefined;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
});
