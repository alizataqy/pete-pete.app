import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import LandingView from "./LandingView";

export default async function Home() {
  // Ambil data session Better Auth dari incoming request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  // Ambil session data yang aman
  const userData = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  } : undefined;

  return (
    <LandingView user={userData} />
  );
}
