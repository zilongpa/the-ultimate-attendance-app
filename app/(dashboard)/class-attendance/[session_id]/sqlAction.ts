"use server";

import { getSQL } from "@/db";
import { Attendance } from "../types";

export default async function sqlAction(query: string) {
    const sql = getSQL();
    // console.log("Executing SQL query:", query);
    return await sql.query(query);
}

export async function fetchData(session_id: number): Promise<Attendance[]> {
    const rawData = await sqlAction(`SELECT a.id AS attendance_id, u.name AS student_name, u.email AS student_email, a.check_in_time FROM attendances a JOIN users u ON a.student_id = u.id WHERE a.session_id = ${session_id};`);
    const data: Attendance[] = rawData.map(record => ({
        id: record.attendance_id,
        name: record.student_name,
        email: record.student_email,
        time: new Date(record.check_in_time),
        status: "present",
    } as Attendance));
    return data;
};