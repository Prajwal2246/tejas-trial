import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hrs ago`;
};

export default function AllQuestionsStudent() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(JSON.parse(localStorage.getItem("questions")) || []);
  }, []);

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-12">
        All Questions
      </h1>

      <div className="max-w-6xl mx-auto flex flex-wrap gap-8">
        {questions.map((q) => (
          <motion.div
  key={q.id}
  whileHover={{ y: -4 }}
  className="
    relative
    w-full md:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.35rem)]
    rounded-3xl border border-white/10
    bg-zinc-900/70 backdrop-blur-xl
    shadow-xl p-8
  "
>
  {/* TIME BADGE */}
  <div className="absolute top-5 right-5">
    <div className="
      flex items-center gap-1.5
      px-3 py-1 rounded-full
      bg-indigo-500/10 text-indigo-400
      text-[11px] font-medium
      border border-indigo-500/20
      backdrop-blur
    ">
      <Clock size={12} />
      {timeAgo(q.createdAt)}
    </div>
  </div>

  {/* TITLE */}
  <h2 className="text-xl font-semibold text-white pr-20">
    {q.title}
  </h2>

  {/* DESCRIPTION */}
  <p className="mt-4 text-sm text-zinc-300 line-clamp-3">
    {q.description}
  </p>

  {/* ACTION */}
  <div className="mt-6 flex justify-end">
    <button className="text-sm text-slate-300 hover:text-indigo-300">
      View Question →
    </button>
  </div>
</motion.div>

        ))}

        {questions.length === 0 && (
          <p className="text-zinc-500 text-center w-full">
            No questions yet.
          </p>
        )}
      </div>
    </div>
  );
}
