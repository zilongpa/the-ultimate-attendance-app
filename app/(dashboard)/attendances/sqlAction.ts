// By Yiyun Sun
"use server";

import { getSQL } from "@/db";
import student from "@/types/student";
import { studentAttendance } from "@/types/studentAttendance";

// interface StudentAttendance {
//     id: number;
//     name: string;
//     email: string;
//     attendance: {
//         time: Date;
//     }[];
// }

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

export async function fetchStudentList(): Promise<student[]> {
    const rawData = await sqlAction(
        `SELECT id, name, email FROM users`
    );
    const data: {
        id: number,
        name: string,
        email: string,
    }[] = rawData.map(record => ({
        id: record.id,
        name: record.name,
        email: record.email,
    }));
    return data;
}