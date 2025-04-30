// By Yiyun Sun, Junhui Huang
//Styled by Kanghuan Xu
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { fetchStudentList, fetchAttendanceData } from "./sqlAction";
import student from "@/types/student";
import { studentAttendance } from "@/types/studentAttendance";
import PieChartIcon from '@mui/icons-material/PieChart';

export default function ClassAttendancePage() {
  const [chosenStudentId, setChosenStudentId] = useState<number>(0);
  const [students, setStudents] = useState<student[]>([]);
  const [attendanceData, setAttendanceData] = useState<studentAttendance[]>(
    []
  );

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
      setAttendanceData([]); // Clear if none selected
    }
  }, [chosenStudentId]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",   // horizontal center
        p: 4,         // padding
      }}
    >
      <Typography
        sx={{
          fontSize: "2rem",
          fontWeight: 600,
          textAlign: "center",
          mb: 1,
        }}
      >
        Student Attendance
      </Typography>

      <Typography
        sx={{
          fontSize: "1rem",
          textAlign: "center",
          color: "text.secondary",
          mb: 3,
        }}
      >
        Please select a student.
      </Typography>

      <Select
        label="Student"
        value={chosenStudentId}
        onChange={(event) => {
          setChosenStudentId(event.target.value as number);
        }}
        sx={{
          display: "block",
          width: 300,
          mx: "auto",  // center dropdown
          mb: 3,
        }}
      >
        <MenuItem value={0} disabled>
          Select a student
        </MenuItem>
        {students.map((stu) => (
          <MenuItem key={stu.id} value={stu.id}>
            {`${stu.name} <${stu.email}>`}
          </MenuItem>
        ))}
      </Select>

      {students && chosenStudentId !== 0 && (
        <Button variant="contained" startIcon={<PieChartIcon />} sx={{ mt: 2, mb: 2 }} onClick={() => {
          window.open(`/attendances/${chosenStudentId}`, "_blank")
        }} fullWidth>View Attendance Report</Button>
      )}

      <Typography
        sx={{
          textAlign: "center",
          mb: 3,
          color: "text.primary",
        }}
      >
        {`Found ${attendanceData.length} attendance records for student ID ${chosenStudentId}`}
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
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
                <TableCell>
                  {row.check_in_time.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
