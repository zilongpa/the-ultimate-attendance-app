"use server";
import { signOut } from "@/auth";

export async function logoutFunc(): Promise<void> {
    await signOut();
}

const Logout = () => null;

export default Logout;