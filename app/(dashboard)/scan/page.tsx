// By Junhui Huang, Yiyun Sun
import Scanner from "@/components/Scanner";
import * as OTPAuth from "otpauth";
import { getSQL } from "@/db";
import { auth } from "@/auth";
import { BSON } from 'bson';

export default function Scan() {
  const period = process.env.TOTP_PERIOD ? Number(process.env.TOTP_PERIOD) : 2;

  async function validate(data: Record<number, string[]>): Promise<string | null> {
    "use server";
    const sql = getSQL();
    const digits = process.env.TOTP_DIGITS ? Number(process.env.TOTP_DIGITS) : 8;
    const session = await auth();
    const newData: Record<number, string[]> = {};
    let sessionValue: string | null = null;

    console.log(data)

    // Decode and convert all strings in data records from Base64 to BSON objects
    for (const [key, values] of Object.entries(data)) {
      newData[Number(key)] = values.map((value) => {
        const binary = atob(value);
        const uint8Array = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const bsonObject = BSON.deserialize(uint8Array);

        // Check if bsonObject.s is consistent
        if (sessionValue === null) {
          sessionValue = bsonObject.s;
        } else if (sessionValue !== bsonObject.s) {
          throw new Error("More than one session value found.");
        }

        return bsonObject.c; // Extract the value of "c" from each BSON object
      });
    }


    data = newData;
    console.log("Decoded data:", data);
    const classSessionId = sessionValue;

    // Fetch the secrets associated with the session
    const secretsQueryResult = await sql`SELECT secret1, secret2, secret3, secret4 FROM sessions WHERE id = ${classSessionId};`;
    if (secretsQueryResult.length === 0) {
      return "No secrets found for the session.";
    }

    let secrets = null;
    try {
      secrets = [
        secretsQueryResult[0].secret1,
        secretsQueryResult[0].secret2,
        secretsQueryResult[0].secret3,
        secretsQueryResult[0].secret4,
      ];
    } catch {
      return "Invalid number of secrets found for the session.";
    }

    // Initialize TOTP instances for each secret
    const totps = Array.from({ length: 4 }, (_, index) =>
      new OTPAuth.TOTP({
        digits: digits,
        period: period,
        secret: OTPAuth.Secret.fromBase32(secrets[index]),
      })
    );

    // Ensure at least 4 intervals of data are provided
    if (Object.keys(data).length < 4) {
      return "Not enough data provided, need at least 4 intervals.";
    }

    // Filter out duplicate values and ensure at least 2 unique values per interval
    const filteredData: Record<number, string[]> = {};
    const seenStrings = new Set<string>();
    const currentTime = Date.now();

    for (const [key, values] of Object.entries(data)) {
      const timestamp = Number(key);

      // Drop intervals that are too old
      if (currentTime - timestamp > 8 * period * 1000) {
        continue;
      }

      const uniqueValues = values.filter((value) => {
        if (seenStrings.has(value)) {
          return false;
        }
        seenStrings.add(value);
        return true;
      });

      if (uniqueValues.length >= 2) {
        filteredData[timestamp] = uniqueValues;
      }
    }

    // Ensure at least 3 intervals with valid data after filtering
    if (Object.keys(filteredData).length < 3) {
      return "Not enough valid data after filtering. Need at least 3 intervals with 50% of the valid pixels.";
    }

    // Validate the filtered data against the TOTP instances
    const validatedData: Record<number, string[]> = {};
    for (const [key, values] of Object.entries(filteredData)) {
      const timestamp = Number(key);
      validatedData[timestamp] = [];

      for (const value of values) {
        let isValid = false;
        for (const totp of totps) {
          try {
            const validation = totp.validate({ token: value, timestamp: timestamp });
            if (validation !== null) {
              isValid = true;
              break;
            }
          } catch {
            continue;
          }
        }
        if (isValid) {
          validatedData[timestamp].push(value);
        }
      }
    }

    // Remove intervals with no valid data
    for (const key of Object.keys(validatedData)) {
      if (validatedData[Number(key)].length === 0) {
        delete validatedData[Number(key)];
      }
    }

    // Ensure at least 3 intervals with valid data after validation
    if (Object.keys(validatedData).length < 3) {
      return "Not enough valid data after validation. Need at least 3 intervals with 50% of the valid pixels.";
    }

    // Check for at least 3 consecutive intervals within the allowed time period
    const timestamps = Object.keys(validatedData).map(Number).sort((a, b) => a - b);
    let consecutiveCount = 1;

    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i - 1] <= period * 1000 * 2) {
        consecutiveCount++;
        if (consecutiveCount === 4) {
          break;
        }
      } else {
        consecutiveCount = 1;
      }
    }

    if (consecutiveCount < 3) {
      return "Not enough consecutive intervals. Need at least 3 consecutive intervals.";
    }

    const thisUserId = session?.user.id;

    // Check if the user is already marked as present in the attendance table
    const existingAttendance = await sql`SELECT id FROM attendances WHERE session_id = ${classSessionId} AND student_id = ${thisUserId};`;
    if (existingAttendance.length > 0) {
      return "You are already in.";
    }

    // Insert a new attendance record for the user
    const attendance = await sql`INSERT INTO attendances (session_id, student_id, check_in_time) VALUES (${classSessionId}, ${thisUserId}, ${new Date().toISOString()}) RETURNING id;`;
    if (attendance.length === 0) {
      return "Failed to insert attendance record.";
    }

    return null;
  }

  return (
    <Scanner submitAction={validate} period={period} />
  );
}
