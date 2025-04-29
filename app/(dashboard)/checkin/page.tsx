// By Junhui Huang
// By Yiyun Sun
import Scanner from "@/components/Scanner";
import * as OTPAuth from "otpauth";
import { getSQL } from "@/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default function CheckIn() {
  async function validate(data: Record<number, string[]>): Promise<string | null> {
    "use server";
    return null;
    const secrets = [new OTPAuth.Secret().utf8, new OTPAuth.Secret().utf8, new OTPAuth.Secret().utf8, new OTPAuth.Secret().utf8];
    const period = 2;
    const digits = 8;

    const session = await auth();

    if (secrets.length !== 4) {
      throw new Error("Validate function requires exactly 4 secrets.");
    }

    const totps = Array(4).fill(null).map((index) =>
      new OTPAuth.TOTP({
        algorithm: "SHA1",
        digits: digits,
        period: period,
        secret: secrets[index],
      })
    );

    if (Object.keys(data).length < 4) {
      return "Not enough data provided, need at least 4 intervals.";
    }

    const filteredData: Record<number, string[]> = {};
    for (const [key, values] of Object.entries(data)) {
      if (values.length >= 2) {
        filteredData[Number(key)] = values;
      }
    }



    if (Object.keys(filteredData).length < 4) {
      return "Not enough valid data after filtering. Need at least 4 intervals with 50% of the valid pixels.";
    }

    const validatedData: Record<number, string[]> = {};
    for (const [key, values] of Object.entries(filteredData)) {
      const timestamp = Number(key);
      validatedData[timestamp] = [];

      for (const value of values) {
        for (const totp of totps) {
          try {
            if (totp.validate({ token: value, timestamp: timestamp * 1000 * 2 }) === 0) {
              break;
            }
          } catch {
            continue;
          }
        }
        validatedData[timestamp].push(value);
      }
    }
    if (Object.keys(validatedData).length < 4) {
      return "Not enough valid data after validation. Need at least 4 intervals with 50% of the valid pixels.";
    } else {
      // Get newest session ID
      const sql = getSQL();
      const sessionId = await sql`SELECT id FROM sessions ORDER BY id DESC LIMIT 1;`;
      if (sessionId.length === 0) {
        throw new Error("No session ID found.");
      }
      const thisSessionId = sessionId[0].id;
      // Get self user id
      const userId = await sql`SELECT id FROM users WHERE email = ${session?.user.email};`;
      if (userId.length === 0) {
        throw new Error("No user ID found.");
      }
      const thisUserId = userId[0].id;
      // Insert into attendance table
      const attendance = await sql`INSERT INTO attendance (session_id, user_id, check_in_time) VALUES (${thisSessionId}, ${thisUserId}, ${Date.now()}) RETURNING id;`;
      if (attendance.length === 0) {
        throw new Error("Failed to insert attendance record.");
      }
    }

    console.log("Validated data:", validatedData);
    return null;
  }




  return (
    <Scanner submitAction={validate} period={2} />
  );
}
