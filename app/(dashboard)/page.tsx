// By Junhui Huang
import { redirect } from 'next/navigation';
import { getSQL } from '@/db';
import { auth } from '@/auth';

export default async function Home() {
    const session = await auth();
    const sql = getSQL();

    // If the user is a student:
    // - Redirect to the scanner page if there are ongoing sessions they haven't attended yet.
    // - Otherwise, redirect to the attendance page.
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
        `;
        if (result.length > 0) {
            redirect("/scan");
        }

        redirect("/attendance");
    } else {
        // If the user is a professor or assistant:
        // - Redirect to the earliest ongoing session if there are any.
        // - Otherwise, redirect to the session creation page.
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
        `;
        if (result.length > 0) {
            redirect(`/sessions/${result[0].id}`);
        }
        redirect(`/new-session`);
    }
}
