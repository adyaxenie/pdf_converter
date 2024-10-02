"use client"
import { sign } from 'crypto';
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";

function Authbutton() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    return (
      <>
        Signed in as {session?.user?.name} <br />
        <button
          className="btn btn-primary"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      {/* Redirect to SignIn component */}
      {/* <button
        className="btn btn-sm text-primary-content mr-2 bg-transparent border-none"
        onClick={() => signIn()}
      >
        Login
      </button> */}
      <button
        className="btn btn-sm border-black hover:blue bg-white text-black w-32"
        onClick={() => signIn()}
      >
        Login
      </button>
    </>
  );
}


export default function Login() {
  return (
        <div>
            <Authbutton />
        </div>
  );
}