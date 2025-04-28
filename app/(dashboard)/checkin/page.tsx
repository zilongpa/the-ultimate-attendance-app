// By Junhui Huang
import Scanner from "@/components/Scanner";
import * as OTPAuth from "otpauth";

export default function Scan() {
  return (
    <Scanner onValidate={(data) => validate(data, ["ab", "ab", "ab", "ab"], 2, 8)} period={2} />
  );
}

function validate(data: Record<number, string[]>, secrets: string[], period: number, digits: number): string | null {
  if (secrets.length !== 4) {
    throw new Error("Validate function requires exactly 4 secrets.");
  }

  return null;

  // const totps = Array(4).fill(null).map((index) =>
  //   new OTPAuth.TOTP({
  //     algorithm: "SHA1",
  //     digits: digits,
  //     period: period,
  //     secret: secrets[index],
  //   })
  // );


}