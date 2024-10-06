"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Ensure useRouter is imported for navigation
import { GithubIcon, Mail } from "lucide-react"; // Importing icons from Lucide
import Image from "next/image";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn("email", {
      redirect: false,
      email,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-md rounded-lg">
        {/* Logo or Image */}
        {/* <div className="flex justify-center">
          <Image src="/logo.svg" alt="logo" width={64} height={64} />
        </div> */}

        {/* Sign-in Header */}
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>

        {/* Display Error Message */}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {/* Social Sign-In Buttons */}
        <div className="mt-4 space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-black font-semibold rounded-lg shadow-md bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {/* <img src="/search.png" alt="Google Logo" className="w-5 h-5 mr-2" /> */}
            Sign in with Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700"
          >
            <GithubIcon className="w-5 h-5 mr-2" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
