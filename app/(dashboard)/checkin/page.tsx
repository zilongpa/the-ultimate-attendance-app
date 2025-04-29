// By Junhui Huang
import Scanner from "@/components/Scanner";
import * as OTPAuth from "otpauth";

export default function CheckIn() {
  async function validate(data: Record<number, string[]>): Promise<string | null> {
    "use server";
    const secrets = [new OTPAuth.Secret().utf8, new OTPAuth.Secret().utf8, new OTPAuth.Secret().utf8, new OTPAuth.Secret().utf8];
    const period = 2;
    const digits = 8;

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
      return "Not enough valid data after filtering. Need at least 4 intervals with 50% values each.";
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
      return "Not enough valid data after validation. Need at least 4 intervals with 50% valid values each.";
    }

    console.log("Validated data:", validatedData);
    return null;

  }




  return (
    <Scanner submitAction={validate} period={2} />
  );
}
