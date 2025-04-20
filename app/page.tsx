
import { auth, signOut } from "@/auth";
import { notFound } from "next/navigation";

const HomePage = async () => {
  const session = await auth();
  // if (!session) return notFound();
  return (
    <main>
      <h1>TODO</h1>
    </main>
  );
};
export default HomePage;