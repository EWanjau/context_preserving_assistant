import { auth0 } from "@/lib/auth0";
import { LoginTicket } from "@/components/login-ticket";

export default async function HomePage() {
  const session = await auth0.getSession();
  if (session?.user) {
    return null;
  }
  return <LoginTicket />;
}
