// By Yiyun Sun
import { getSQL } from "@/db";
import Printer from "@/components/Printer";
import { Box, Typography } from "@mui/material";
import StaticAttendanceTable from "./StaticAttendanceTable";
import { redirect } from "next/navigation";
import { PageContainer } from "@toolpad/core/PageContainer";
import { auth } from "@/auth";
import { formatSessionName } from "@/utils";

export default async function GetSessionAttendance({
    params,
}: {
    params: Promise<{ session_id: string }>;
}) {

    const session = await auth();
    if (session?.user.role != "professor" && session?.user.role != "assistant") {
        redirect("/");
    }

    const sql = getSQL();
    const { session_id } = await params;
    const thisSessionId = Number(session_id);
    if (isNaN(thisSessionId)) {
        throw new Error("Invalid session ID provided.");
    }
    const sessionSecrets = await sql`
    SELECT secret1, secret2, secret3, secret4, start_time, end_time, name, type
    FROM sessions 
    WHERE id = ${thisSessionId};
    `;
    if (sessionSecrets.length === 0) {
        redirect("/sessions");
    }

    const sessionEnded: boolean = new Date(sessionSecrets[0].end_time) < new Date();

    const secretsArray = Array.from({ length: 4 }, (_, i) => sessionSecrets[0][`secret${i + 1}`]);

    return (
        <PageContainer>
            <Typography
                sx={{
                    fontSize: "2rem",
                    fontWeight: 600,
                    textAlign: "center",
                    mb: 3,
                }}
            >
                {sessionSecrets[0].name || formatSessionName(sessionSecrets[0].type, sessionSecrets[0].start_time)}
            </Typography>
            {
                !sessionEnded ? (
                    <Box
                        sx={{
                            width: "30vw",
                            marginLeft: "auto",
                            marginRight: "auto",
                            mb: 3,
                        }}
                    >
                        <Printer secrets={secretsArray} period={2} digits={8} sessionId={thisSessionId} />
                    </Box>) : (
                    <Box
                        sx={{
                            textAlign: "center",
                            mb: 3,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "1.2rem",
                                fontWeight: 500,
                            }}
                        >
                            This session has ended.
                        </Typography>
                    </Box>
                )
            }

            <StaticAttendanceTable session_id={thisSessionId} />
        </PageContainer>
    )

}