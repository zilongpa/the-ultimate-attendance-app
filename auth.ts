// By Junhui Huang, Yiyun Sun
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { Provider } from "next-auth/providers";
import NeonAdapter from "@auth/neon-adapter"
import { getPool } from "@/db";

const providers: Provider[] = [
    Google,
];

const defaultProfessorsEmails: string[] = (process.env.DEFAULT_PROFESSORS_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email !== "");

export const providerMap = providers.map((provider) => {
    if (typeof provider === 'function') {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    }
    return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    const pool = getPool();
    return {
        adapter: NeonAdapter(pool),
        providers,
        secret: process.env.AUTH_SECRET,
        session: {
            strategy: "jwt"
        },
        pages: {
            signIn: '/auth/signin',
        },
        callbacks: {
            authorized({ auth: session, request: { nextUrl } }) {
                const isLoggedIn = !!session?.user;
                return isLoggedIn;
            },
            async jwt({ token, user }) {
                if (user) {
                    const client = await pool.connect();
                    try {
                        const result = await client.query(
                            'SELECT role FROM users WHERE id = $1',
                            [user.id]
                        );
                        token.role = result.rows[0]?.role || 'student';

                        if (defaultProfessorsEmails.includes(user?.email ?? "")) {
                            token.role = 'professor';
                        }
                    } finally {
                        client.release();
                    }
                    token.id = user.id;
                }
                return token;
            },
            async session({ session, token }) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.email = token.email;
                return session;
            },
        },
    }
})
