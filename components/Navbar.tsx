import { signIn, signOut } from "@/auth";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

type NavbarProps = {
  session: Session | null;
};

const Navbar = ({ session }: NavbarProps) => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 backdrop-blur-md bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <h1 className="text-xl font-semibold text-gray-800">RepoRater</h1>

          {session?.user ? (
            <div className="flex items-center space-x-4">
              {/* User Profile Picture and Name */}
              <div className="flex items-center space-x-2 relative">
                {session.user.image && (
                  <>
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User Profile"}
                      width={32}
                      height={32}
                      className="rounded-full relative z-10"
                    />
                  </>
                )}
                <Link
                  href={`/user/${session.user.id}`}
                  className="text-gray-800 font-medium"
                >
                  {session.user.name}
                </Link>
              </div>

              {/* Sign Out Button */}
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className=" text-black bg-gray-50 font-medium py-2 px-6 rounded-2xl shadow-sm transition duration-300"
                >
                  Sign Out
                </button>
              </form>
              <button className=" text-black bg-gray-100 font-medium py-2 px-4 rounded-full shadow-sm transition duration-300">
                +
              </button>
            </div>
          ) : (
            // Login Button
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-2xl shadow-md flex items-center space-x-2 transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-2"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Login with GitHub
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
