// By Junhui Huang
import Printer from "@/components/Printer";
import * as OTPAuth from "otpauth";

export default function Scan() {
  return (
    <Printer secrets={[(new OTPAuth.Secret().utf8), (new OTPAuth.Secret().utf8), (new OTPAuth.Secret().utf8), (new OTPAuth.Secret().utf8)]} period={2} digits={8}/>
  );
}
