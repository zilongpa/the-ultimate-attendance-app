//By Kanghuan Xu
import { auth } from "@/auth";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  // auth() returns { user, ... } or null
  return session?.user ?? null;
}
