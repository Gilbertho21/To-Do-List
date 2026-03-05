"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  priority: string;
  category: string;
  dueDate?: Timestamp | null;
  createdAt?: Timestamp;
};

export default function Home() {
  const categories = ["Kerja", "Kuliah", "Pribadi", "Belanja"];

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("low");
  const [category, setCategory] = useState("Kerja");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const taskCollection = collection(db, "tasks");

  useEffect(() => {
    const unsubscribe = onSnapshot(taskCollection, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || "",
          completed: data.completed || false,
          priority: data.priority || "low",
          category: data.category || "Kerja",
          dueDate: data.dueDate || null,
          createdAt: data.createdAt || null,
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex justify-center items-center p-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md text-white">

        <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">
          ⚡ To Do List
        </h1>

        {/* INPUT SECTION */}
        <div className="space-y-4 mb-8">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            placeholder="Tambah tugas..."
          />

          {/* PRIORITY */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none"
          >
            <option value="low" className="text-black">Low</option>
            <option value="medium" className="text-black">Medium</option>
            <option value="high" className="text-black">High</option>
          </select>

          {/* CATEGORY DROPDOWN */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-black">{cat}</option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none"
          />

          <button
            onClick={tambahTask}
            className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 py-3 rounded-xl font-semibold tracking-wide shadow-lg shadow-blue-500/40"
          >
            + Tambah Task
          </button>
        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {tasks.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  onClick={() => toggleTask(item.id, item.completed)}
                  className={`cursor-pointer text-lg font-medium ${
                    item.completed ? "line-through text-gray-400" : "text-white"
                  }`}
                >
                  {item.text}
                </span>

                <button
                  onClick={() => hapusTask(item.id)}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  ❌
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    item.priority === "high"
                      ? "bg-red-500/30 text-red-400"
                      : item.priority === "medium"
                      ? "bg-yellow-500/30 text-yellow-400"
                      : "bg-green-500/30 text-green-400"
                  }`}>
                  ⚡ {item.priority.toUpperCase()}
                </span>

                <span>📁 {item.category}</span>
              </div>

              {item.dueDate && typeof item.dueDate.toDate === "function" && (
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