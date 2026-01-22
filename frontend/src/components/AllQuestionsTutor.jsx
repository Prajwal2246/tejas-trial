import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hrs ago`;
};

export default function AllQuestionsTutor() {
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setQuestions(JSON.parse(localStorage.getItem("questions")) || []);
  }, []);

  const open = questions.filter((q) => q.status === "open");
  const accepted = questions.filter((q) => q.status === "accepted" && q.acceptedBy === "tutor-1"); // Hardcoded tutor

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-16">
        Tutor Dashboard
      </h1>

      {/* OPEN QUESTIONS */}
      <section className="mb-20">
        <h2 className="text-2xl text-white mb-6">Open Questions</h2>
        <div className="flex flex-wrap gap-8">
          {open.map((q) => (
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
              <h2 className="text-xl text-white font-semibold pr-20">{q.title}</h2>
              <p className="mt-4 text-sm text-zinc-300 line-clamp-3">{q.description}</p>

              {/* VIEW BUTTON */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate(`/tutor/question/${q.id}`)}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  View →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACCEPTED QUESTIONS */}
      <section>
        <h2 className="text-2xl text-white mb-6">Accepted Questions</h2>
        {accepted.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/40 p-10 text-center text-zinc-500">
            No accepted questions yet
          </div>
        ) : (
          <div className="flex flex-wrap gap-8">
            {accepted.map((q) => (
              <motion.div
                key={q.id}
                className="
                  relative
                  w-full md:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.35rem)]
                  rounded-3xl border border-white/10
                  bg-zinc-900/70 backdrop-blur-xl
                  shadow-xl p-8
                "
              >
                <div className="absolute top-5 right-5">
                  <div className="
                    flex items-center gap-1.5
                    px-3 py-1 rounded-full
                    bg-emerald-500/10 text-emerald-400
                    text-[11px] font-medium
                    border border-emerald-500/20
                  ">
                    Accepted
                  </div>
                </div>
                <h2 className="text-xl text-white font-semibold pr-20">{q.title}</h2>
                <p className="mt-4 text-sm text-zinc-300">{q.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
