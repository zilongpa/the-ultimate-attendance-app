// By Yiyun Sun, Junhui Huang
"use server";

import { getSQL } from "@/db";
import { formatSessionName } from "@/utils";

export default async function sqlAction(query: string) {
    const sql = getSQL();
    // console.log("Executing SQL query:", query);
    return await sql.query(query);
}

export async function fetchData(): Promise<{ id: number, name: string }[]> {
    const rawData = await sqlAction(
        `SELECT id, name, type, start_time FROM sessions ORDER BY start_time DESC;`
    );
    
    const data: { id: number, name: string }[] = rawData.map(record => ({
        id: record.id,
        name: record.name || formatSessionName(record.type, record.start_time),
    }));
    
    return data;
};