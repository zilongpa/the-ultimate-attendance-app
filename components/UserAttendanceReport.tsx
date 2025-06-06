// By Junhui Huang
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { getSQL } from '@/db';
import { PieChart } from '@mui/x-charts/PieChart';
import { auth } from '@/auth';
import { formatAttendanceStatus, formatSessionName, capitalizeFirstLetter } from '@/utils';

export default async function UserAttendanceReport({ id }: { id?: number }) {
    // Authenticate the user and retrieve session information
    const session = await auth();
    id = id || session?.user.id; // If no ID is provided, generate the report for the logged-in user

    // Fetch user information (name and email) from the database
    const sql = getSQL();
    const info = await sql`SELECT "name", email FROM users WHERE "id" = ${id};`;

    // Handle cases where the user is not found in the database
    if (info.length === 0) {
        return <Typography variant="h6">User not found.</Typography>;
    }

    // Restrict access for students attempting to view other users' reports
    if (session?.user.role === "student" && session?.user.id !== id) {
        return <Typography variant="h6">You do not have permission to view this report.</Typography>;
    }

    // Extract user details (name and email)
    const { name, email } = info[0];
    const subject = session?.user.id === id ? "You" : name;

    // Fetch overall attendance summary for generating pie charts
    const overall = (await sql`SELECT
        s.type AS session_type,
        COUNT(*) AS total_sessions,
        COUNT(a.student_id) AS attended_sessions
        FROM sessions AS s
        LEFT JOIN attendances AS a
        ON a.session_id = s.id
        AND a.student_id = ${id}
        GROUP BY s.type
        ORDER BY s.type;
        `);

    // Fetch detailed attendance data for rendering in the table
    const details = (await sql`SELECT
        s.id AS session_id,
        s.name AS session_name,
        s.type AS session_type,
        s.date,
        s.start_time,
        s.end_time,
        a.check_in_time
        FROM sessions AS s
        LEFT JOIN attendances AS a
        ON a.session_id = s.id
        AND a.student_id = ${id}
        ORDER BY s.date, s.start_time;
        `);

    return (
        <>
            {/* Display a personalized welcome message or report header */}
            <Typography sx={{ mb: 1 }}>
                {session?.user.id === id
                    ? `Welcome, ${name}!`
                    : `You are viewing the attendance report of ${name} (${email}).`}
            </Typography>

            <Box>
                {/* Summary section containing overall attendance statistics */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box
                        sx={{
                            flex: '1 1 100%',
                            padding: 2,
                            borderRadius: 2,
                            border: '1px solid #ccc',
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Summary
                        </Typography>
                        {/* Render a pie chart summarizing overall attendance */}
                        <PieChart
                            series={[
                                {
                                    innerRadius: 0,
                                    outerRadius: 80,
                                    data: [
                                        {
                                            id: 1,
                                            value: overall.reduce((sum, item) => sum + parseInt(item.attended_sessions), 0),
                                            label: "Attended",
                                        },
                                        {
                                            id: 2,
                                            value: overall.reduce((sum, item) => sum + (parseInt(item.total_sessions) - parseInt(item.attended_sessions)), 0),
                                            label: "Absent",
                                        },
                                    ],
                                },
                            ]}
                            height={200}
                            colors={["#2DBBC4", "#086AD8"]}
                        />
                        {/* Display a textual summary of overall attendance */}
                        <Typography variant="body1" sx={{ marginTop: 2 }}>
                            {overall.reduce((sum, item) => sum + parseInt(item.attended_sessions), 0) === overall.reduce((sum, item) => sum + parseInt(item.total_sessions), 0)
                                ? `${subject} attended all sessions.`
                                : overall.reduce((sum, item) => sum + parseInt(item.attended_sessions), 0) === 0
                                    ? `${subject} never attended any sessions.`
                                    : `${subject} attended ${overall.reduce((sum, item) => sum + parseInt(item.attended_sessions), 0)} out of ${overall.reduce((sum, item) => sum + parseInt(item.total_sessions), 0)} sessions, which is about ${((overall.reduce((sum, item) => sum + parseInt(item.attended_sessions), 0) / overall.reduce((sum, item) => sum + parseInt(item.total_sessions), 0)) * 100).toFixed(2)}% of the total.`}
                        </Typography>
                    </Box>

                    {/* Render individual attendance summaries for each session type */}
                    {overall.map((item, index) => {
                        const colors = {
                            lecture: ["#F7AFBB", "#D94A5A"],
                            lab: ["#7c50b9", "#4A2E6E"],
                            discussion: ["#ffc36d", "#b37a3d"],
                        };
                        const themeColors = colors[item.session_type as keyof typeof colors] || ["#ccc", "#999"]; // Fallback colors
                        return (
                            <Box
                                key={index}
                                sx={{
                                    flex: '1 1 30%',
                                    minWidth: '20em',
                                    padding: 2,
                                    borderRadius: 2,
                                    border: '1px solid #ccc',
                                    marginBottom: 2,
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    {capitalizeFirstLetter(item.session_type)} Attendance
                                </Typography>
                                {/* Render a pie chart for attendance of a specific session type */}
                                <PieChart
                                    series={[
                                        {
                                            innerRadius: 0,
                                            outerRadius: 80,
                                            data: [
                                                {
                                                    id: 1,
                                                    value: parseInt(item.attended_sessions),
                                                    label: "Attended",
                                                },
                                                {
                                                    id: 2,
                                                    value: parseInt(item.total_sessions) - parseInt(item.attended_sessions),
                                                    label: "Absent",
                                                },
                                            ],
                                        },
                                    ]}
                                    height={200}
                                    colors={themeColors}
                                />
                                {/* Display a textual summary for the specific session type */}
                                <Typography variant="body1" sx={{ marginTop: 2 }}>
                                    {parseInt(item.attended_sessions) === parseInt(item.total_sessions)
                                        ? `${subject} attended all ${item.total_sessions} ${item.session_type} sessions.`
                                        : parseInt(item.attended_sessions) === 0
                                            ? `${subject} never attended any ${item.session_type} sessions (${item.total_sessions} total).`
                                            : `${subject} attended ${item.attended_sessions} out of ${item.total_sessions} ${item.session_type} session${parseInt(item.total_sessions) > 1 ? "s" : ""} (${((parseInt(item.attended_sessions) / parseInt(item.total_sessions)) * 100).toFixed(2)}%).`}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Detailed attendance record table */}
            <Typography variant="h4" sx={{ mt: 4, mb: 1 }}>Details</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Session Name</TableCell>
                            <TableCell>Attendance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Render detailed attendance data for each session */}
                        {details.map((row) => (
                            <TableRow key={row.session_id}>
                                <TableCell>
                                    {row.session_name || formatSessionName(row.session_type, row.start_time)}
                                </TableCell>
                                <TableCell>
                                    <Typography color={row.check_in_time ? "success" : "error"}>
                                        {formatAttendanceStatus(row.check_in_time)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
