// By Junhui Huang
// Originally created for Toolpad CRUD operations. Although it wasn't successfully integrated with Toolpad, 
// this module now serves as a library of server-side actions for managing user-related operations.
'use server';
import { getSQL } from "@/db";
import { User } from "./types";

/*
 * Fetch a single user by their ID.
 * @param userId - The ID of the user to retrieve.
 * @returns The User object if found, otherwise null.
 */
export async function getOne(userId: string): Promise<User | null> {
    console.log('ACTION TRIGGERED: getOne', { userId });
    const sql = getSQL();
    const result = await sql`
        SELECT id, name, email, role
        FROM users
        WHERE id = ${userId}
        LIMIT 1
    `;
    if (result.length === 0) {
        return null;
    }
    return result[0] as User;
}

/*
 * Fetch all users in the database.
 * @returns An array of User objects (empty array if none found).
 */
export async function getMany(): Promise<User[]> {
    console.log('ACTION TRIGGERED: getMany');
    const sql = getSQL();
    const result = await sql`
        SELECT id, name, email, role
        FROM users
    `;
    return (result.length === 0 ? [] : (result as User[]));
}

/*
 * Create a new user record.
 */
export async function createOne(data: User): Promise<User | null> {
    console.log('ACTION TRIGGERED: createOne', JSON.stringify(data));
    const sql = getSQL();
    const result = await sql`
        INSERT INTO users (name, email, role)
        VALUES (${data.name}, ${data.email}, ${data.role})
        RETURNING id, name, email, role
    `;
    return (result.length === 0 ? null : (result[0] as User));
}

/**
 * Update an existing user by their ID.
 * Only fields provided in the data object are updated; others remain unchanged.
 */
export async function updateOne(
    userId: string,
    data: Partial<User>
): Promise<User | null> {
    console.log('ACTION TRIGGERED: updateOne', { userId, data: JSON.stringify(data) });
    const sql = getSQL();
    const result = await sql`
        UPDATE users
        SET name  = COALESCE(${data.name},  name),
            email = COALESCE(${data.email}, email),
            role  = COALESCE(${data.role},  role)
        WHERE id = ${userId}
        RETURNING id, name, email, role
    `;
    return (result.length === 0 ? null : (result[0] as User));
}

/**
 * Delete a user record by their ID.
 */
export async function deleteOne(userId: string): Promise<User | null> {
    console.log('ACTION TRIGGERED: deleteOne', { userId });
    const sql = getSQL();
    const result = await sql`
        DELETE FROM users
        WHERE id = ${userId}
        RETURNING id, name, email, role
    `;
    return (result.length === 0 ? null : (result[0] as User));
}
