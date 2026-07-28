"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInUser, signUpUser } from "@/lib/auth";

type LoginFormProps = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = mode === "signin"
      ? await signInUser(email, password)
      : await signUpUser(email, password, fullName);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(result.user?.is_admin ? "/admin" : redirectTo || "/catalog");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:flex-row">
        <div className="flex-1 rounded-[1.5rem] bg-stone-900 p-8 text-white">
          <img src="/logo.png" alt="Alankrutha logo" className="h-16 w-auto object-contain" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.3em] text-stone-300">Customer access</p>
          <h1 className="mt-3 text-3xl font-semibold">Welcome back to Alankrutha</h1>
          <p className="mt-3 text-sm text-stone-300">Secure sign-in for shoppers, order tracking, and faster checkout.</p>
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex gap-2 rounded-full border border-stone-200 p-1">
            <button type="button" onClick={() => setMode("signin")} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === "signin" ? "bg-stone-900 text-white" : "text-stone-600"}`}>
              Sign in
            </button>
            <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === "signup" ? "bg-stone-900 text-white" : "text-stone-600"}`}>
              Sign up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="rounded-2xl border border-stone-200 p-4">
                <label className="text-sm font-medium text-stone-700">Full name</label>
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-full border border-stone-300 px-4 py-3" placeholder="Priya Sharma" required />
              </div>
            )}
            <div className="rounded-2xl border border-stone-200 p-4">
              <label className="text-sm font-medium text-stone-700">Email</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-full border border-stone-300 px-4 py-3" placeholder="you@example.com" required />
            </div>
            <div className="rounded-2xl border border-stone-200 p-4">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-full border border-stone-300 px-4 py-3" placeholder="••••••••" required />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-stone-900 px-5 py-3 font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="text-sm text-stone-600">Need help? <Link href="/contact" className="font-semibold text-stone-900">Contact support</Link></p>
        </div>
      </div>
    </main>
  );
}
