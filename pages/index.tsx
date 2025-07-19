import Dashboard from "../components/Dashboard";
import AuthButton from "../components/AuthButton";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main>
      <AuthButton />
      {session ? <Dashboard /> : <p>Please login to access your dashboard.</p>}
    </main>
  );
}