"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: string;
  category: string;
  dueDate?: Timestamp | null;
  createdAt?: Timestamp | null;
};

export default function Home() {
  const router = useRouter();

  const categories = ["Kerja", "Kuliah", "Pribadi", "Belanja"];

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("low");
  const [category, setCategory] = useState("Kerja");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const taskCollection = collection(db, "tasks");

  // 🔐 CEK LOGIN
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 🔥 FIRESTORE LISTENER
  useEffect(() => {
    const q = query(taskCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          text: data.text ?? "",
          completed: data.completed ?? false,
          priority: data.priority ?? "low",
          category: data.category ?? "Kerja",
          dueDate: data.dueDate ?? null,
          createdAt: data.createdAt ?? null,
        };
      });

      setTasks(taskList);
    });

    return () => unsubscribe();
  }, []);

  // ➕ TAMBAH TASK
  const tambahTask = async () => {
    if (!task.trim()) return;

    try {
      await addDoc(taskCollection, {
        text: task,
        completed: false,
        priority,
        category,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        createdAt: serverTimestamp(),
      });

      setTask("");
      setPriority("low");
      setCategory("Kerja");
      setDueDate("");
    } catch (error) {
      console.error("Gagal tambah task:", error);
    }
  };

  // ✔ TOGGLE TASK
  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), {
        completed: !completed,
      });
    } catch (error) {
      console.error("Gagal update task:", error);
    }
  };

  // ❌ HAPUS TASK
  const hapusTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error("Gagal hapus task:", error);
    }
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ⏳ LOADING AUTH
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex justify-center items-center p-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md text-white">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            ⚡ To Do List
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* INPUT */}
        <div className="space-y-4 mb-8">

          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none"
            placeholder="Tambah tugas..."
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3"
          >
            <option value="low" className="text-black">Low</option>
            <option value="medium" className="text-black">Medium</option>
            <option value="high" className="text-black">High</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-black">
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3"
          />

          <button
            onClick={tambahTask}
            className="w-full bg-blue-500 hover:bg-blue-600 transition py-3 rounded-xl font-semibold"
          >
            + Tambah Task
          </button>

        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {tasks.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition"
            >

              <div className="flex justify-between items-center mb-2">

                <span
                  onClick={() => toggleTask(item.id, item.completed)}
                  className={`cursor-pointer text-lg ${
                    item.completed
                      ? "line-through text-gray-400"
                      : "text-white"
                  }`}
                >
                  {item.text}
                </span>

                <button
                  onClick={() => hapusTask(item.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  ❌
                </button>

              </div>

              <div className="flex justify-between text-sm">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    item.priority === "high"
                      ? "bg-red-500/30 text-red-400"
                      : item.priority === "medium"
                      ? "bg-yellow-500/30 text-yellow-400"
                      : "bg-green-500/30 text-green-400"
                  }`}
                >
                  ⚡ {item.priority.toUpperCase()}
                </span>

                <span>📁 {item.category}</span>

              </div>

              {item.dueDate && (
                <div className="text-xs text-gray-400 mt-2">
                  📅 {item.dueDate.toDate().toLocaleDateString()}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}