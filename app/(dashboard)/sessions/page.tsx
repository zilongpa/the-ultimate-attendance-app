import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClassAttendancePage from "./ClassAttendancePage";

export default async function SessionsPage() {
    const session = await auth();
    if (session?.user.role !== "professor" && session?.user.role !== "assistant") {
        redirect("/");
    }
    return (
        <ClassAttendancePage />
    )
}