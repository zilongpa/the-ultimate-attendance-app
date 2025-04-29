// By Yiyun Sun
import { getSQL } from "@/db";
import { NeonQueryFunction } from "@neondatabase/serverless";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

// const dbString = "INSERT INTO sessions () "

const sessionTypes: string[] = ['lecture', 'lab', 'discussion']

const dbConn: NeonQueryFunction<false, false> = getSQL();

function formatDateForSQL(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default async function newSession() {
    const sessionDuration = Number(process.env.SESSION_DURATION_MINUTES);
    return (
        <form action={async (formData: FormData) => {
            const type = formData.get("type") as string;
            const currentTime = new Date();
            const endTime = new Date(currentTime);
            endTime.setMinutes(currentTime.getMinutes() + sessionDuration);
            const start_time = currentTime.toISOString();
            const end_time = endTime.toISOString();
            const date = formatDateForSQL(currentTime);

            try {
                await dbConn`INSERT INTO sessions (type, date, start_time, end_time) VALUES (${type}, ${date}, ${start_time}, ${end_time})`;
            } catch (error) {
                console.error("Failed to insert session:", error);
                throw new Error("Failed to create session. Please try again.");
            };
        }}>
            <label htmlFor="type-select">Select a session type:</label>
            <select id="type-select" name="type" required>
                {sessionTypes.map((sessionType) => (
                    <option key={sessionType} value={sessionType}>
                        {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
                    </option>
                ))}
            </select>
            <Typography>Please note that each session last for {sessionDuration} minutes</Typography>
            <Button type="submit">Create Session</Button>
        </form>
    )

}