// By Junhui Huang
import { redirect } from 'next/navigation';
import { getSQL } from '@/db';
import { auth } from '@/auth';

export default async function Home() {
    const session = await auth()
    const sql = getSQL();
    if (session?.user.role === "student") {
        const result = await sql`
            SELECT
            s.id,
            s.name,
            s.type,
            s.date,
            s.start_time,
            s.end_time
            FROM sessions AS s
            LEFT JOIN attendances AS a
            ON a.session_id = s.id
            AND a.student_id = ${session.user.id}
            WHERE s.start_time <= NOW()
            AND s.end_time   >  NOW()
            AND a.id IS NULL
            ORDER BY s.start_time;
        `
        if (result.length > 0) {
            redirect("/scan")
        }

        redirect("/attendance")
    } else {
        const result = await sql`
            SELECT
            id,
            name,
            type,
            date,
            start_time,
            end_time
            FROM sessions
            WHERE start_time <= NOW()
            AND end_time   >  NOW()
            ORDER BY start_time;
        `
        if (result.length > 0) {
            redirect(`/sessions/${result[0].id}`)
        }
        redirect(`/new-session`)
    }
}
