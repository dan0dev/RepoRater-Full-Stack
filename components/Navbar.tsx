// Navbar.tsx (Server Component)
import { signIn, signOut } from "@/auth";
import { Session } from "next-auth";
import { NavbarClient } from "./NavbarClient";

type NavbarProps = {
  session: Session | null;
};

const Navbar = ({ session }: NavbarProps) => {
  async function handleSignIn() {
    "use server";
    await signIn("github");
  }

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <NavbarClient
      session={session}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
    />
  );
};

export default Navbar;
