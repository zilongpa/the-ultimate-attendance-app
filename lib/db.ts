import { PrismaClient } from "@/generated/prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    // Disabling the no-var and no-unused-vars rules to allow for the use of var in this context.
    // This is a workaround for the issue of TypeScript not recognizing the global variable
    // eslint-disable-next-line no-var, no-unused-vars
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;