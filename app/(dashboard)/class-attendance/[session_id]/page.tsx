// By Yiyun Sun
// import { DataSourceCache } from "@toolpad/core";
import { getSQL } from "@/db";
import Printer from "@/components/Printer";
import { Box } from "@mui/material";
import StaticAttendanceTable from "./StaticAttendanceTable";
import { redirect } from "next/navigation";



export default async function GetSessionAttendance({
    params,
}: {
    params: Promise<{ session_id: string }>;
}) {
    // const attendanceCache = new DataSourceCache();
    const sql = getSQL();
    const { session_id } = await params;
    const thisSessionId = Number(session_id);
    if (isNaN(thisSessionId)) {
        throw new Error("Invalid session ID provided.");
    }
    const sessionSecrets = await sql`SELECT secret1, secret2, secret3, secret4 FROM sessions WHERE id = ${thisSessionId};`;
    if (sessionSecrets.length === 0) {
        redirect("/class-attendance");
    }
    const secretsArray = Array.from({ length: 4 }, (_, i) => sessionSecrets[0][`secret${i + 1}`]);

    return (
        <>
            <Box
                sx={{
                    width: "30vw",
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                <Printer secrets={secretsArray} period={2} digits={8} />
            </Box>

            {/* <GetAttendanceCurd session_id={thisSessionId} sqlAction={sqlAction} /> */}
            <StaticAttendanceTable session_id={thisSessionId} />
        </>
    )

}