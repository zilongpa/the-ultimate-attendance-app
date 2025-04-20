"use server";
import { signIn } from "@/auth";
import Button from '@mui/material/Button';

export async function loginFunc(): Promise<void> {
    await signIn("google");
}

const Login = () => null;

export default Login;