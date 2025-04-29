// By Yiyun Sun
"use client";

import { Box, Button, Menu, MenuItem, Select, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchData } from "./sqlAction";

interface Session {
    id: number;
    start_time: Date;
}

export default function ClassAttendancePage() {

    const [chosenSession, setChosenSession] = useState<Number>(0);
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        const fetchSessions = async () => {
            const data = await fetchData();
            console.log("Fetched sessions:", data);
            setSessions(data);
        };
        fetchSessions();
    }, []);

    return (
        <Box>
            <Typography>Class Attendance</Typography>
            <Typography>Please select a past session.</Typography>
            <Select
                label="Session"
                value={chosenSession}
                onChange={(event) => {
                    setChosenSession(event.target.value as number);
                }}
                sx={{
                    width: 300,
                    marginTop: 2,
                }}
                onSubmit={() => {
                    // Handle form submission here
                    console.log("Selected session:", chosenSession);
                    redirect(`/class-attendance/${chosenSession}`);
                }}
            >
                <MenuItem value={0} disabled>
                    Select a session
                </MenuItem>
                {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                        {session.start_time.toLocaleString()}
                    </MenuItem>
                ))}
            </Select>
            <Button
                variant="contained"
                onClick={() => {
                    // Handle form submission here
                    console.log("Selected session:", chosenSession);
                    redirect(`/class-attendance/${chosenSession}`);
                }}
                sx={{
                    marginTop: 2,
                }}

            > Submit </Button>
        </Box>
    );
}