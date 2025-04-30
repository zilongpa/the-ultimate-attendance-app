// By Junhui Huang
// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export { auth as middleware } from "@/auth"

// Bloak evyrything except for the API routes and static files if not logged in
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
