// By Yiyun Sun
"use server";

import { studentAttendance } from "@/types/studentAttendance";

import { getSQL } from "@/db";
import student from "@/types/student";

export default async function sqlAction(query: string) {
    const sql = getSQL();
    // console.log("Executing SQL query:", query);
    return await sql.query(query);
}

export async function fetchAttendanceData(student_id: number): Promise<studentAttendance[]> {
    const rawData = await sqlAction(
        `SELECT a.id, a.check_in_time FROM sessions s JOIN attendances a ON s.id = a.session_id WHERE a.student_id = ${student_id}`
    );
    const data: { id: number, check_in_time: Date }[] = rawData.map(record => ({
        id: record.id,
        check_in_time: new Date(record.check_in_time),
    }));
    return data;
};

export async function fetchStudentInfo(email: string): Promise<student> {
    const rawData = await sqlAction(
        `SELECT id, name, email FROM users WHERE email = '${email}'`
    );
    if (rawData.length === 0) {
        throw new Error("No user found with the provided email.");
    }
    console.log(rawData);
    const data: student = {
        id: rawData[0].id,
        name: rawData[0].name,
        email: rawData[0].email,
    };
    return data;
}