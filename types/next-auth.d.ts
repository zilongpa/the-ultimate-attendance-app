// By Junhui Huang
import NextAuth from "next-auth"

// Override the default NextAuth session type so that it includes the user role and makes typescript happy
declare module "next-auth" {
    interface Session {
        user: {
            role: string
        } & DefaultSession["user"]
    }
}
