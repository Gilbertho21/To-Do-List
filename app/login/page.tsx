"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Email dan Password harus diisi");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User:", userCredential.user);

      alert("Login berhasil ✅");

      router.push("/");

    } catch (error) {
      console.error(error);
      alert("Login gagal ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900">

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-white">

        <h1 className="text-3xl font-bold text-center mb-6">
          🔐 Login
        </h1>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          {/* 🔥 REGISTER LINK */}
          <p className="text-center text-sm text-gray-300 mt-4">
            Belum punya akun?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-green-400 cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>

        </div>

      </div>

    </main>
  );
}