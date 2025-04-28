// app/api/attendanceStats/route.ts

import { NextResponse } from "next/server";
import {
  getCollection,
  USER_COLLECTION,
  ATTENDANCE_COLLECTION,
} from "../../../db";

type SessionStats = {
  sessionDate: string; 
  attended: number;
  absent: number;
};

export async function GET() {
  try {
    // Grab the two collections
    const attendanceCol = await getCollection<{ date: Date }>(
      ATTENDANCE_COLLECTION
    );
    const userCol = await getCollection<{ role: string }>(USER_COLLECTION);

    // 1) Fetch every attendance record
    const allAttendance = await attendanceCol.find().toArray();

    // 2) Count all STUDENT users
    const totalStudents = await userCol.countDocuments({ role: "STUDENT" });

    // 3) Group check-ins by day
    const countsByDate: Record<string, number> = {};
    allAttendance.forEach(({ date }) => {
      const day = date.toISOString().split("T")[0];
      countsByDate[day] = (countsByDate[day] || 0) + 1;
    });

    // 4) Build and sort the stats array
    const stats: SessionStats[] = Object.entries(countsByDate)
      .map(([sessionDate, attended]) => ({
        sessionDate,
        attended,
        absent: totalStudents - attended,
      }))
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

    return NextResponse.json(stats);
  } catch (e: any) {
    console.error("Failed to load attendanceStats:", e);
    return NextResponse.json(
      { error: "Unable to load attendance stats" },
      { status: 500 }
    );
  }
}