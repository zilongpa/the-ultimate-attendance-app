"use server";
import { signIn } from "@/auth";

export async function loginFunc(): Promise<void> {
    await signIn("google");
}

const Login = () => null;

export default Login;