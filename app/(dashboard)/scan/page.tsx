// By Junhui Huang, Yiyun Sun
import Scanner from "@/components/Scanner";
import * as OTPAuth from "otpauth";
import { getSQL } from "@/db";
import { auth } from "@/auth";

export default function Scan() {
  const period = process.env.TOTP_PERIOD ? Number(process.env.TOTP_PERIOD) : 2;

  async function validate(data: Record<number, string[]>): Promise<string | null> {
    "use server";
    const sql = getSQL();
    const digits = process.env.TOTP_DIGITS ? Number(process.env.TOTP_DIGITS) : 8;
    const session = await auth();

    const sessionQueryResult = await sql`SELECT id FROM sessions ORDER BY id DESC LIMIT 1;`;
    if (sessionQueryResult.length === 0) {
      return "No session ID found.";
    }

    const classSessionId = sessionQueryResult[0].id;

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

    const totps = Array.from({ length: 4 }, (_, index) =>
      new OTPAuth.TOTP({
        digits: digits,
        period: period,
        secret: OTPAuth.Secret.fromBase32(secrets[index]),
      })
    );

    if (Object.keys(data).length < 4) {
      return "Not enough data provided, need at least 4 intervals.";
    }

    const filteredData: Record<number, string[]> = {};
    const seenStrings = new Set<string>();


    for (const [key, values] of Object.entries(data)) {
      const uniqueValues = values.filter((value) => {
        if (seenStrings.has(value)) {
          return false;
        }
        seenStrings.add(value);
        return true;
      });

      if (uniqueValues.length >= 2) {
        filteredData[Number(key)] = uniqueValues;
      }
    }

    if (Object.keys(filteredData).length < 3) {
      return "Not enough valid data after filtering. Need at least 3 intervals with 50% of the valid pixels.";
    }

    const validatedData: Record<number, string[]> = {};
    for (const [key, values] of Object.entries(filteredData)) {
      const timestamp = Number(key);
      validatedData[timestamp] = [];

      for (const value of values) {
        let isValid = false;
        for (const totp of totps) {
          try {
            const validation = totp.validate({ token: value, timestamp: timestamp });
            // console.log(`Validating ${value} against ${totp.secret.base32} at timestamp ${timestamp}, ${validation}, ${totp.generate({ timestamp: timestamp })}`);
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

    for (const key of Object.keys(validatedData)) {
      if (validatedData[Number(key)].length === 0) {
        delete validatedData[Number(key)];
      }
    }

    if (Object.keys(validatedData).length < 3) {
      return "Not enough valid data after validation. Need at least 3 intervals with 50% of the valid pixels.";
    }

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

    // Check if the user already exists in the attendance table
    const existingAttendance = await sql`SELECT id FROM attendances WHERE session_id = ${classSessionId} AND student_id = ${thisUserId};`;
    if (existingAttendance.length > 0) {
      return "You are already in.";
    }

    // Insert into attendance table
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
