import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Video } from "lucide-react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

/* 🔹 Firestore-safe timeAgo */
const timeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate();
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hrs ago`;
};

export default function StudentQuestionDetail() {
  const { id } = useParams(); // question id
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔹 Live listener (so Join button appears instantly) */
  useEffect(() => {
    const ref = doc(db, "questions", id);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setQuestion({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) return <p className="text-white p-10 text-center">Loading...</p>;

  if (!question)
    return <p className="text-red-400 p-10 text-center">Question not found</p>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-6 space-y-6">
      {/* Back */}
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate("/my-questions")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-full max-w-4xl
          rounded-3xl border border-white/20
          bg-zinc-900/70 backdrop-blur-xl
          shadow-2xl p-10 space-y-8
        "
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-4xl font-bold text-white">{question.title}</h2>
          <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
            <Clock size={16} />
            {timeAgo(question.createdAt)}
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-lg leading-relaxed">
          {question.description}
        </p>

        {/* Status */}
        {question.status === "open" && (
          <span className="inline-block px-6 py-3 rounded-xl bg-yellow-500/20 text-yellow-400 font-semibold">
            Waiting for a tutor to accept…
          </span>
        )}

        {question.status === "accepted" && question.roomId && (
          <button
            onClick={() => navigate(`/session/${question.roomId}`)}
            className="
              inline-flex items-center gap-2
              px-8 py-3
              bg-green-500 text-white
              font-semibold rounded-xl
              shadow-lg
              hover:bg-green-600 hover:scale-105
              transition-transform active:scale-95 cursor-pointer
            "
          >
            <Video size={18} />
            Join Session
          </button>
        )}
      </motion.div>
    </div>
  );
}
