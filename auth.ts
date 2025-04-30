// By Junhui Huang
// This file configures authentication for the application using NextAuth and Google as the provider.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import NeonAdapter from "@auth/neon-adapter";
import { getPool } from "@/db";

// Define the authentication providers. Currently, only Google is used.
const providers: Provider[] = [
    Google,
];

// Parse default professor emails from environment variables.
const defaultProfessorsEmails: string[] = (process.env.DEFAULT_PROFESSORS_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email !== "");

// Parse default assistant emails from environment variables.
const defaultAssistantsEmails: string[] = (process.env.DEFAULT_ASSISTANTS_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email !== "");

// Map providers to their IDs and names for easier reference.
export const providerMap = providers.map((provider) => {
    if (typeof provider === 'function') {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    }
    return { id: provider.id, name: provider.name };
});

// Configure NextAuth with custom settings and callbacks.
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    const pool = getPool(); // Get a database connection pool.
    return {
        adapter: NeonAdapter(pool), // Use NeonAdapter for database interactions.
        providers, // Authentication providers.
        secret: process.env.AUTH_SECRET, // Secret for signing tokens.
        session: {
            strategy: "jwt", // Use JWT for session management.
        },
        pages: {
            signIn: '/auth/signin', // Custom sign-in page.
        },
        callbacks: {
            // Check if the user is authorized to access the application.
            authorized({ auth: session, request: { nextUrl } }) {
                const isLoggedIn = !!session?.user;
                return isLoggedIn;
            },
            // Customize the JWT token with user role and ID.
            async jwt({ token, user }) {
                if (user) {
                    const client = await pool.connect();
                    try {
                        // Fetch the user's role from the database.
                        const result = await client.query(
                            'SELECT role FROM users WHERE id = $1',
                            [user.id]
                        );
                        token.role = result.rows[0]?.role || 'student';

                        // Override role based on default emails.
                        if (defaultProfessorsEmails.includes(user?.email ?? "")) {
                            token.role = 'professor';
                        } else if (defaultAssistantsEmails.includes(user?.email ?? "")) {
                            token.role = 'assistant';
                        }
                    } finally {
                        client.release(); // Release the database connection.
                    }
                    token.id = user.id; // Add user ID to the token.
                }
                return token;
            },
            // Add custom fields to the session object.
            async session({ session, token }) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.email = token.email;
                return session;
            },
        },
    };
});
