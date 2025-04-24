import { auth } from "@/auth";

const HomePage = async () => {
  const session = await auth();
  console.log("Session:", session);
  return (
    <main>
      <h1>Your role is {session?.user?.role}</h1>
    </main>
  );
};
export default HomePage;