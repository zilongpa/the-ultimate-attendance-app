// By Junhui Huang

// Formats the attendance status string to make future changes to the format easier.
export function formatAttendanceStatus(checkInTime: string | null): string {
    if (checkInTime) {
        return `Checked in at ${new Date(checkInTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    } else {
        return `Absent`;
    }
}

// Generates a default session name if one is not provided.
// The session name is based on the session type and start time.
export function formatSessionName(session_type: string, start_time: string): string {
    return `${session_type.charAt(0).toUpperCase() + session_type.slice(1)} at ${new Date(
        start_time
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
        month: "narrow",
        day: "numeric",
    })}`;
}

// Capitalizes the first letter of a given string.
// This is because enums in the database are all lowercase.
export function capitalizeFirstLetter(input: string): string {
    if (!input) return input;
    return input.charAt(0).toUpperCase() + input.slice(1);
}
