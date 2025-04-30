// By Yiyun Sun
"use client";
import { PageContainer } from '@toolpad/core/PageContainer';
import { fetchStudentInfo, fetchAttendanceData } from './sqlAction';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import student from '@/types/student';
import { studentAttendance } from '@/types/studentAttendance';

export default function Attendence() {

  const session = useSession();
  const email = session.data?.user?.email || '';

  const [attendanceData, setAttendanceData] = useState<studentAttendance[]>([]);
  const [studentData, setStudentData] = useState<student>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const student = await fetchStudentInfo(email);
        if (student.id) {
          setStudentData(student);
          const data = await fetchAttendanceData(student.id);
          setAttendanceData(data);
        } else {
          console.error("No student found for the provided email.");
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, [email]);

  return (
    <PageContainer>
      <Box>
        <Typography>{
          !studentData ? "loading..." : (
            `Welcome ${studentData.name}! Your email is ${studentData.email}.`
          )
        }</Typography>

        <Typography>
          {
            !attendanceData.length ? "No attendance records found." : `Found ${attendanceData.length} attendance records for student ID ${studentData?.id}`
          }
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.check_in_time.toString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageContainer>
  );
}
