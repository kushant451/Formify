"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "../context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard/generate");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface-1 rounded-2xl p-8 shadow-lg">
        <p className="text-center font-medium mb-1">Formify</p>
        <h1 className="text-lg font-medium text-center mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Log in to keep generating content</p>

        <label className="text-xs text-gray-500">Email</label>
        <input type="email" className="w-full rounded-xl mb-3 mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="text-xs text-gray-500">Password</label>
        <input type="password" className="w-full rounded-xl mb-5 mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button disabled={loading} className="w-full bg-brand-400 text-white rounded-xl mb-4">
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="text-xs text-center text-gray-500">
          Don't have an account? <Link href="/signup" className="text-brand-400">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
