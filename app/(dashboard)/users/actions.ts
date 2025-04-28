'use server'
import { getSQL } from "@/db"
import { User } from './types';

export async function getOne(userId: string): Promise<User | null> {
    console.log('ACTION TRIGGERED: getOne', { userId });
    const sql = getSQL()
    const result = await sql`SELECT id, name, email, role FROM users WHERE id = ${userId} LIMIT 1`
    if (result.length === 0) {
        return null;
    }
    return result[0] as User
}

export async function getMany(): Promise<User[]> {
    console.log('ACTION TRIGGERED: getMany');
    const sql = getSQL()
    const result = await sql`SELECT id, name, email, role FROM users`
    if (result.length === 0) {
        return [];
    }
    return result as User[]
}

export async function createOne(data: User): Promise<User | null> {
    console.log('ACTION TRIGGERED: createOne', JSON.stringify(data));
    const sql = getSQL()
    const result = await sql`INSERT INTO users (name, email, role) VALUES (${data.name}, ${data.email}, ${data.role}) RETURNING id, name, email, role`
    if (result.length === 0) {
        return null;
    }
    return result[0] as User
}

export async function updateOne(userId: string, data: Partial<User>): Promise<User | null> {
    console.log('ACTION TRIGGERED: updateOne', { userId, data: JSON.stringify(data) });
    const sql = getSQL()
    const result = await sql`
        UPDATE users 
        SET name = COALESCE(${data.name}, name),
            email = COALESCE(${data.email}, email),
            role = COALESCE(${data.role}, role)
        WHERE id = ${userId}
        RETURNING id, name, email, role
    `
    if (result.length === 0) {
        return null;
    }
    return result[0] as User
}

export async function deleteOne(userId: string): Promise<User | null> {
    console.log('ACTION TRIGGERED: deleteOne', { userId });
    const sql = getSQL()
    const result = await sql`
        DELETE FROM users 
        WHERE id = ${userId}
        RETURNING id, name, email, role
    `
    if (result.length === 0) {
        return null;
    }
    return result[0] as User
}
