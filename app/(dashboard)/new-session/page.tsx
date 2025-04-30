// By Yiyun Sun
import { getSQL } from "@/db";
import { NeonQueryFunction } from "@neondatabase/serverless";
import Button from "@mui/material/Button";
import { redirect } from "next/navigation";
import { InputLabel } from "@mui/material";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import * as OTPAuth from "otpauth";
import { PageContainer } from "@toolpad/core/PageContainer";

const sessionTypes: string[] = ['lecture', 'lab', 'discussion']

const dbConn: NeonQueryFunction<false, false> = getSQL();

function formatDateForSQL(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default async function newSession() {
    return (
        <PageContainer>
            <form action={async (formData: FormData) => {
                "use server";
                let sessionID;
                const sessionName = formData.get("name");
                const sessionDuration = Number(formData.get("duration"));
                const type = formData.get("type") as string;
                const currentTime = new Date();
                const endTime = new Date(currentTime);
                endTime.setMinutes(currentTime.getMinutes() + sessionDuration);
                const start_time = currentTime.toISOString();
                const end_time = endTime.toISOString();
                const date = formatDateForSQL(currentTime);
                const sessionSecrets = new Array(4).fill(null).map(() => new OTPAuth.Secret().base32);

                try {
                    const res = await dbConn`
                INSERT INTO sessions (name, type, date, start_time, end_time, secret1, secret2, secret3, secret4) 
                VALUES (${sessionName && (sessionName as string).trim() !== "" ? sessionName : null}, ${type}, ${date}, ${start_time}, ${end_time}, ${sessionSecrets[0]}, ${sessionSecrets[1]}, ${sessionSecrets[2]}, ${sessionSecrets[3]}) 
                RETURNING id;
                `;
                    sessionID = res[0].id;
                } catch (error) {
                    console.error("Failed to insert session:", error);
                    throw new Error("Failed to create session. Please try again.");
                };

                return redirect(`/sessions/${sessionID}`);
            }}>

                
                <InputLabel htmlFor="session-name" sx={{ textAlign: 'center' }}>Session Name</InputLabel>
                <TextField
                    id="session-name"
                    name="name"
                    variant="outlined"
                    placeholder="Leave blank for default name"
                    fullWidth
                    sx={{ display: 'block', marginBottom: 2, width: '50%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}
                />


                <InputLabel htmlFor="type-select" sx={{ textAlign: 'center' }}>Select a session type:</InputLabel>
                <Select
                    id="type-select"
                    name="type"
                    defaultValue="lecture"
                    sx={{ display: 'block', marginBottom: 2, width: '50%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}
                    required
                >
                    {sessionTypes.map((sessionType) => (
                        <MenuItem
                            key={sessionType}
                            value={sessionType}
                            sx={{ textAlign: 'center' }}
                        >
                            {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
                        </MenuItem>
                    ))}
                </Select>
                

                <InputLabel htmlFor="duration-input" sx={{ textAlign: 'center' }}>Session Duration (minutes):</InputLabel>
                <TextField
                    id="duration-input"
                    name="duration"
                    type="number"
                    defaultValue={10}
                    sx={{ display: 'block', marginBottom: 2, width: '50%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}
                    required
                />

                


                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ display: 'block', marginTop: 2, width: '50%', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}
                >
                    Create Session
                </Button>
            </form>
        </PageContainer>
    )
}
