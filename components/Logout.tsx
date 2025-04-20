"use server";
import { signOut } from "@/auth";
import Button from "@mui/material/Button";

export async function logoutFunc(): Promise<void> {
    await signOut();
}

const Logout = () => null;

export default Logout;