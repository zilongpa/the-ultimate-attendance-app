// By Yiyun Sun
import { getSQL } from "@/db";
import { NeonQueryFunction } from "@neondatabase/serverless";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { redirect } from "next/navigation";
import { InputLabel } from "@mui/material";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import * as OTPAuth from "otpauth";

// const dbString = "INSERT INTO sessions () "

const sessionTypes: string[] = ['lecture', 'lab', 'discussion']

const dbConn: NeonQueryFunction<false, false> = getSQL();

function formatDateForSQL(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default async function newSession() {
    const sessionDuration = Number(process.env.SESSION_DURATION_MINUTES) || 10;
    return (
        <form action={async (formData: FormData) => {
            "use server";
            let sessionID;
            const sessionDuration = Number(process.env.SESSION_DURATION_MINUTES) || 10;
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
                INSERT INTO sessions (type, date, start_time, end_time, secret1, secret2, secret3, secret4) 
                VALUES (${type}, ${date}, ${start_time}, ${end_time}, ${sessionSecrets[0]}, ${sessionSecrets[1]}, ${sessionSecrets[2]}, ${sessionSecrets[3]}) 
                RETURNING id;
                `;
                sessionID = res[0].id; // Assuming the returned object has an 'id' field
            } catch (error) {
                console.error("Failed to insert session:", error);
                throw new Error("Failed to create session. Please try again.");
            };

            return redirect(`/class-attendance/${sessionID}`); // Redirect to the session page after creation
        }}>
            <InputLabel
                htmlFor="type-select"
                sx={{ display: 'block', marginTop: '8px', marginBottom: '8px', textAlign: 'center' }}
            >
                Select a session type:
            </InputLabel>
            <Select
                id="type-select"
                name="type"
                defaultValue="lecture"
                sx={{ display: 'block', marginBottom: '16px', width: '30%', marginLeft: 'auto', marginRight: 'auto' }}
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
            <Typography
                variant="body2"
                sx={{ textAlign: 'center', marginBottom: '16px' }}
            >
                Please note that each session last for {sessionDuration} minutes
            </Typography>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ display: 'block', marginTop: '16px', width: '30%', marginLeft: 'auto', marginRight: 'auto' }}
            >
                Create Session
            </Button>
        </form>
    )

}