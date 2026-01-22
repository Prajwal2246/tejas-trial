import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hrs ago`;
};

export default function TutorQuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    const q = questions.find((item) => item.id === Number(id));
    setQuestion(q);
  }, [id]);

  const acceptQuestion = () => {
    const questions = JSON.parse(localStorage.getItem("questions")) || [];
    const updated = questions.map((q) =>
      q.id === Number(id) ? { ...q, status: "accepted", acceptedBy: "tutor-1" } : q
    );
    localStorage.setItem("questions", JSON.stringify(updated));
    navigate("/all-question-tutor");
  };

  if (!question)
    return <p className="text-white p-10 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-6 space-y-6">
      
      {/* Back Button */}
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate("/all-question-tutor")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl rounded-3xl border border-white/20 bg-zinc-900/70 backdrop-blur-xl shadow-2xl p-10 space-y-8 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {question.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
              <Clock size={16} />
              {timeAgo(question.createdAt)}
            </div>
          </div>

          {/* Description */}
          <p className="text-zinc-300 text-lg leading-relaxed">
            {question.description}
          </p>

          {/* Student Info */}
          <p className="text-sm text-zinc-500">
            Asked by:{" "}
            <span className="text-white font-semibold">
              {question.studentName}
            </span>
          </p>

          {/* Accept Action */}
          {question.status === "open" ? (
            <button
              onClick={acceptQuestion}
              className="relative inline-flex items-center px-8 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 hover:scale-105 transition-transform active:scale-95 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 rounded-xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity"></span>
              Accept Question & Start Session
            </button>
          ) : (
            <span className="inline-block px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold">
              Already Accepted
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
