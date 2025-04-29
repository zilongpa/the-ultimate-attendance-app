"use client";

import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Attendance } from "../types";
import { fetchData } from "./sqlAction";

export default function StaticAttendanceTable(
    props: { session_id: number }
) {
    const [data, setData] = React.useState<Attendance[]>([]);

    React.useEffect(() => {
        const fetch = async () => {
            // "use server";
            try {
                const result = await fetchData(props.session_id);
                setData(result);
                return;
            } catch (error) {
                console.error("Error fetching attendance data:", error);
            }
        };

        fetch(); // Initial fetch
        const interval = setInterval(fetch, 5000); // Fetch every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [props.session_id]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data &&
                        data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.status}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}