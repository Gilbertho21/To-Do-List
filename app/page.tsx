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
  Timestamp
} from "firebase/firestore";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: Timestamp;
};

export default function Home() {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const taskCollection = collection(db, "tasks");

  useEffect(() => {
    const unsubscribe = onSnapshot(taskCollection, (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));

      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [taskCollection]);

  const tambahTask = async () => {
    if (!task.trim()) return;

    await addDoc(taskCollection, {
      text: task,
      completed: false,
      createdAt: serverTimestamp(),
    });

    setTask("");
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
    <main className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          🚀 Realtime To-Do App
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-black"
            placeholder="Tambah tugas..."
          />
          <button
            onClick={tambahTask}
            className="bg-blue-500 text-black px-4 rounded-lg"
          >
            +
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
            >
              <span
                onClick={() => toggleTask(item.id, item.completed)}
                className={`cursor-pointer text-black ${
                  item.completed ? "line-through" : ""
                }`}
              >
                {item.text}
              </span>

              <button
                onClick={() => hapusTask(item.id)}
                className="text-black"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}