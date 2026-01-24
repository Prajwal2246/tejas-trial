import { useEffect, useState } from "react";
// 1. IMPORT useNavigate
import { useNavigate } from "react-router-dom"; 
import { Clock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

/* 🔹 Firestore-safe timeAgo */
const timeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate();
  const diff = Math.floor((Date.now() - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export default function AllQuestionsStudent() {
  const { user } = useAuth();
  // 2. INITIALIZE the hook
  const navigate = useNavigate(); 
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "questions"),
      where("studentId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error:", err);
        if (err.message.includes("requires an index")) {
          setError("MISSING INDEX: Check console for the link.");
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-12">My Questions</h1>

      

      {loading ? (
        <div className="flex justify-center py-20 text-white">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
        </div>
      ) : (
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
              <div className="absolute top-5 right-5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-medium border border-indigo-500/20">
                  <Clock size={12} />
                  {timeAgo(q.createdAt)}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-white pr-20">
                {q.title}
              </h2>

              <p className="mt-4 text-sm text-zinc-300 line-clamp-3">
                {q.description}
              </p>

              <div className="mt-6 flex justify-end">
                {/* 3. BUTTON NOW WORKS CORRECTLY */}
                <button 
                  className="text-sm text-slate-300 hover:text-indigo-300 transition-colors"
                  onClick={() => navigate(`/student/question/${q.id}`)}
                >
                  View Question →
                </button>
              </div>
            </motion.div>
          ))}

          {!error && questions.length === 0 && (
            <p className="text-zinc-500 text-center w-full py-10">
              You haven’t asked any questions yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}