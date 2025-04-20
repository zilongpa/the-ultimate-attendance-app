import NextAuth, { type DefaultSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import { Role } from "@/generated/prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            name: string;
            email: string;
            role: Role[];
            img?: string;
        } & DefaultSession["user"];
    }
}

const presetEmails = JSON.parse(process.env.PRESET_EMAILS as string);
const adminEmails = presetEmails["admin"] || [];
const facultyEmails = presetEmails["faculty"] || [];


export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // get user from db with the email
                // if there is no user with the email, create new user
                // else set the user data to token
                let loginUser = await db.myUser.findUnique({
                    where: { email: user.email || "" },
                });
                if (!loginUser) {
                    // create new user if not exists
                    const newUser: { email: string; name: string; role: string[] } = {
                        email: user.email || "",
                        name: user.name || "",
                        role: [],
                    };
                    if (adminEmails.includes(user.email || "")) {
                        newUser.role.push(Role.ADMIN);
                    } else if (facultyEmails.includes(user.email || "")) {
                        newUser.role.push(Role.FACULTY);
                    } else {
                        newUser.role.push(Role.STUDENT);
                    };
                    loginUser = await db.myUser.create({
                        data: {
                            email: newUser.email,
                            name: newUser.name,
                            role: { set: newUser.role as Role[] },
                        },
                    });
                }
                token.email = user.email || "";
                token.name = user.name || "";
                token.img = user.image || "";
                token.role = (loginUser?.role || []) as Role[]; // Ensure role is explicitly typed as Role[]
            }
            return token; // Ensure token is always returned
        },

        async session({ session, token }) {
            if (token) {
                // set the token data to session
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.img = token.img as string;
                session.user.role = (token.role || []) as Role[]; // Ensure role is explicitly typed as Role[]
            }
            return session;
        },

        redirect() {
            return "/";
        },
    },
});