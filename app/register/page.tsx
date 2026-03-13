"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Register berhasil ✅");
      router.push("/");
    } catch (error) {
      alert("Register gagal ❌");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 px-4">

      <div className="w-full max-w-sm backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-white transition-all duration-500 hover:scale-[1.02]">

        <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">
          📝 Register
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all placeholder-gray-300"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all placeholder-gray-300"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg shadow-green-500/30"
          >
            Register
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 font-medium"
          >
            Kembali ke Login
          </button>

        </div>

      </div>

    </main>
  );
}