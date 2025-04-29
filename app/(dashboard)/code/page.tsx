// By Junhui Huang
import Printer from "@/components/Printer";
import { Typography } from "@mui/material";
import * as OTPAuth from "otpauth";

export default function Scan() {
  
  return (
    <div style={{ height: "50%", width: "50%", margin: "1em auto" }}>
      <Printer secrets={[(new OTPAuth.Secret().utf8), (new OTPAuth.Secret().utf8), (new OTPAuth.Secret().utf8), (new OTPAuth.Secret().utf8)]} period={2} digits={8} />
      <Typography variant="h5" sx={{ mt: 1, textAlign: "center" }}>Use your device to scan the pixel area above 个</Typography>
    </div>
  );
}
