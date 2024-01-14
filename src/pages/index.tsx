import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-0 right-0 top-60 grid place-items-center">
        <div className="flex text-5xl mb-12">
          <h1 className="font-mono">Welcome to</h1>
          <h1 className="font-mono font-black">&nbsp;Tone.</h1>
        </div>

        <div className="flex">
          {status === "unauthenticated" ? (
            <button
              className="mr-4 cursor-crosshair font-mono bg-gray-100 hover:bg-gray-300 text-black-700 font-semibold py-2 px-4 border border-grey-600 hover:border-transparent rounded-lg"
              onClick={() => signIn("spotify")}
            >
              sign in
            </button>
          ) : (
            <button
              className="cursor-crosshair font-mono bg-gray-100 hover:bg-gray-300 text-black-700 font-semibold py-2 px-4 border border-grey-600 hover:border-transparent rounded-lg"
              onClick={() => signOut()}
            >
              sign out
            </button>
          )}
          {/* <button
            className="mr-4 cursor-crosshair font-mono bg-gray-100 hover:bg-gray-300 text-black-700 font-semibold py-2 px-4 border border-grey-600 hover:border-transparent rounded-lg"
            onClick={() => signIn("spotify")}
          >
            sign in
          </button>

          <button
            className="cursor-crosshair font-mono bg-gray-100 hover:bg-gray-300 text-black-700 font-semibold py-2 px-4 border border-grey-600 hover:border-transparent rounded-lg"
            onClick={() => signOut()}
          >
            sign out
          </button> */}
        </div>
      </div>
    </div>
  );
}
