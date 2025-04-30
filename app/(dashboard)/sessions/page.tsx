// By Yiyun Sun
//Styled by Kanghuan Xu
"use client";

import React, { useEffect, useState } from "react";
import { Button, MenuItem, Select, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { fetchData } from "./sqlAction";
import session from "@/types/session";
import { PageContainer } from "@toolpad/core/PageContainer";

export default function ClassAttendancePage() {
  const [chosenSession, setChosenSession] = useState<number>(0);
  const [sessions, setSessions] = useState<session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const data = await fetchData();
      console.log("Fetched sessions:", data);
      setSessions(data);
    };
    fetchSessions();
  }, []);

  return (
    <PageContainer
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto", 
        p: 4,     
      }}
    >
      <Typography
        sx={{
          fontSize: "2rem",
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
        }}
      >
        Select a Past Session
      </Typography>

      <Select
        label="Session"
        value={chosenSession}
        onChange={(e) => setChosenSession(e.target.value as number)}
        sx={{
          display: "block",
          width: 300,
          mx: "auto",  
          mb: 3,
        }}
      >
        <MenuItem value={0} disabled>
          Select a session
        </MenuItem>
        {sessions.map((sess) => (
          <MenuItem key={sess.id} value={sess.id}>
            {sess.start_time.toLocaleString()}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        disabled={chosenSession === 0}
        onClick={() => redirect(`/sessions/${chosenSession}`)}
        sx={{
          display: "block",
          mx: "auto",
          mt: 2,
        }}
      >
        Submit
      </Button>
    </PageContainer>
  );
}
