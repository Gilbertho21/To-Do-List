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
  const [filterCategory, setFilterCategory] = useState("Semua");

  const taskCollection = collection(db, "tasks");

  // 🔐 CEK LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 🔥 FIRESTORE LISTENER
  useEffect(() => {
    const q = query(taskCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
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

  const tambahTask = async () => {
    if (!task.trim()) return;

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
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await updateDoc(doc(db, "tasks", id), {
      completed: !completed,
    });
  };

  const hapusTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading...
      </div>
    );
  }

  const filteredTasks =
    filterCategory === "Semua"
      ? tasks
      : tasks.filter((t) => t.category === filterCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white flex justify-center items-center p-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">⚡ To Do List</h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm text-white"
          >
            Logout
          </button>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
          <div className="bg-white/10 p-3 rounded-xl">
            <p>Total</p>
            <p className="font-bold">{tasks.length}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <p>Selesai</p>
            <p className="font-bold">
              {tasks.filter((t) => t.completed).length}
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <p>Belum</p>
            <p className="font-bold">
              {tasks.filter((t) => !t.completed).length}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full mb-4 bg-gray-700 text-white border border-gray-500 rounded-xl px-4 py-3"
        >
          <option value="Semua" style={{ color: "black", backgroundColor: "white" }}>
            Semua
          </option>
          {categories.map((cat) => (
            <option
              key={cat}
              value={cat}
              style={{ color: "black", backgroundColor: "white" }}
            >
              {cat}
            </option>
          ))}
        </select>

        {/* INPUT */}
        <div className="space-y-4 mb-8">

          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-500 rounded-xl px-4 py-3"
            placeholder="Tambah tugas..."
          />

          {/* PRIORITY */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-500 rounded-xl px-4 py-3"
          >
            <option value="low" style={{ color: "black", backgroundColor: "white" }}>
              Low
            </option>
            <option value="medium" style={{ color: "black", backgroundColor: "white" }}>
              Medium
            </option>
            <option value="high" style={{ color: "black", backgroundColor: "white" }}>
              High
            </option>
          </select>

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-500 rounded-xl px-4 py-3"
          >
            {categories.map((cat) => (
              <option
                key={cat}
                value={cat}
                style={{ color: "black", backgroundColor: "white" }}
              >
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-500 rounded-xl px-4 py-3"
          />

          <button
            onClick={tambahTask}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-semibold text-white"
          >
            + Tambah Task
          </button>

        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {filteredTasks.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 border border-white/20 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() =>
                      toggleTask(item.id, item.completed)
                    }
                    className="w-5 h-5 accent-green-500"
                  />

                  <span
                    className={`text-lg ${
                      item.completed
                        ? "line-through text-gray-400"
                        : ""
                    }`}
                  >
                    {item.text}
                  </span>
                </div>

                <button
                  onClick={() => hapusTask(item.id)}
                  className="text-red-400 hover:text-red-600 text-lg"
                >
                  ❌
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <span>⚡ {item.priority.toUpperCase()}</span>
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