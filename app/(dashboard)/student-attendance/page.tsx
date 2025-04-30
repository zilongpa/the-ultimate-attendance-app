// By Yiyun Sun
"use client";

import { Box, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchStudentList, fetchAttendanceData } from "./sqlAction";
import student from "@/types/student";
import { studentAttendance } from "@/types/studentAttendance";

export default function ClassAttendancePage() {

    const [chosenStudentId, setChosenStudentId] = useState<number>(0);
    const [students, setStudents] = useState<student[]>([]);
    const [attendanceData, setAttendanceData] = useState<studentAttendance[]>([]);

    useEffect(() => {
        // Fetch students
        const fetchStudents = async () => {
            const data = await fetchStudentList();
            console.log("Fetched students:", data);
            setStudents(data);
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        // Fetch attendance data for the chosen student
        const fetchAttendance = async () => {
            const data = await fetchAttendanceData(chosenStudentId as number);
            console.log("Fetched attendance data:", data);
            setAttendanceData(data);
        };
        if (chosenStudentId) {
            fetchAttendance();
        } else {
            setAttendanceData([]); // Clear attendance data if no student is selected
        }
    }, [chosenStudentId]
    )

    return (
        <>
            <Box>
                <Typography>Class Attendance</Typography>
                <Typography>Please select a student.</Typography>
                <Select
                    label="Student"
                    value={chosenStudentId}
                    onChange={(event) => {
                        setChosenStudentId(event.target.value as number);
                    }}
                    sx={{
                        width: 300,
                        marginTop: 2,
                    }}
                    onSubmit={() => {
                        // Handle form submission here
                        console.log("Selected student:", chosenStudentId);
                    }}
                >
                    <MenuItem value={0} disabled>
                        Select a student
                    </MenuItem>
                    {students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                            {`${student.name} <${student.email}>`}
                        </MenuItem>
                    ))}
                </Select>
                <Typography>
                    {`Found ${attendanceData.length} attendance records for student ID ${chosenStudentId}`}
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
        </>
    );
}