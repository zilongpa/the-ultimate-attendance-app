import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import db from "@/lib/db";
import { Role } from "@/generated/prisma/client";

const presetEmails = JSON.parse(process.env.PRESET_EMAILS as string);
const adminEmails = presetEmails["admin"] || [];
const facultyEmails = presetEmails["faculty"] || [];

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            allowDangerousEmailAccountLinking: true,
            async profile(profile) {
                const userEmail = profile.email;
                const userRecord = await db.user.findUnique({
                    where: { email: userEmail },
                    select: { role: true }
                });
                let userRoles: Role[] = [];
                if (userRecord) {
                    // user exists in db
                    userRoles = userRecord?.role || [];
                } else {
                    // create new user if not exists
                    const newUser: { email: string; name: string; role: string[] } = {
                        email: profile.email,
                        name: profile.name,
                        role: [],
                    };
                    if (adminEmails.includes(profile.email || "")) {
                        newUser.role.push(Role.ADMIN);
                    } else if (facultyEmails.includes(profile.email || "")) {
                        newUser.role.push(Role.FACULTY);
                    };
                    newUser.role.push(Role.STUDENT);

                    const loginUser = await db.user.create({
                        data: {
                            email: newUser.email,
                            name: newUser.name,
                            role: { set: newUser.role as Role[] },
                        },
                    });
                    userRoles = loginUser.role || [];
                }
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: userRoles,
                };
            }
        })
    ],
} satisfies NextAuthConfig;