// By Junhui Huang
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { getSQL } from '@/db';
import { auth } from '@/auth';

export default async function SessionAttendanceReport({ id }: { id: number }) {
    const login = await auth();
    const sql = getSQL();

    if (!login?.user || (login.user.role === 'student')) {
        return <Typography variant="h6">You do not have permission to view this report.</Typography>;
    }

    const [{ attended = 0, absent = 0 } = {}] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE a.check_in_time IS NOT NULL) AS attended,
      COUNT(*) FILTER (WHERE a.check_in_time IS NULL)  AS absent
    FROM users         AS u
    LEFT JOIN attendances AS a
      ON a.student_id = u.id
     AND a.session_id = ${id}
  `;

    const details = await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      a.check_in_time
    FROM users AS u
    LEFT JOIN attendances AS a
      ON a.student_id = u.id
     AND a.session_id = ${id}
    WHERE u.role = 'student'
    ORDER BY (a.check_in_time IS NOT NULL) DESC, u.name;
  `;

    const subject = 'This session';
    const total = attended + absent;

    return (
        <>
            <Typography sx={{ mb: 1 }} variant="h5">
                Attendance Report&nbsp;•&nbsp;Session #{id}
            </Typography>
            <Box
                sx={{
                    padding: 2,
                    borderRadius: 2,
                    border: '1px solid #ccc',
                    maxWidth: 480,
                    mb: 4,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Summary
                </Typography>

                <PieChart
                    series={[
                        {
                            innerRadius: 0,
                            outerRadius: 80,
                            data: [
                                { id: 1, value: attended, label: 'Checked-in' },
                                { id: 2, value: absent, label: 'Absent' },
                            ],
                        },
                    ]}
                    height={200}
                    colors={['#2DBBC4', '#086AD8']}
                />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    {attended === total
                        ? `${subject}: everyone checked in (${total}/${total}).`
                        : attended === 0
                            ? `${subject}: nobody checked in (${total} total).`
                            : `${subject}: ${attended} of ${total} students checked in (${((attended / total) * 100).toFixed(2)}%).`}
                </Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Details
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Attendance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {details.map((row: any) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.name ?? 'Unnamed'}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>
                                    <Typography color={row.check_in_time ? 'success.main' : 'error.main'}>
                                        {row.check_in_time
                                            ? `Checked in @ ${new Date(row.check_in_time).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}`
                                            : 'Absent'}
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
