// By Yiyun Sun
"use server";

import { getSQL } from "@/db";

export default async function sqlAction(query: string) {
    const sql = getSQL();
    // console.log("Executing SQL query:", query);
    return await sql.query(query);
}

export async function fetchData(): Promise<{ id: number, start_time: Date }[]> {
    const rawData = await sqlAction(
        `SELECT id, start_time FROM sessions`
    );
    const data: { id: number, start_time: Date }[] = rawData.map(record => ({
        id: record.id,
        start_time: new Date(record.start_time),
    }));
    return data;
};