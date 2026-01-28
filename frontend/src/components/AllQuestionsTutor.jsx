import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
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

export default function AllQuestionsTutor() {
  const { user } = useAuth(); // ✅ logged-in tutor
  const [open, setOpen] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    /* 🔹 Open questions */
    const openQuery = query(
      collection(db, "questions"),
      where("status", "==", "open"),
    );

    /* 🔹 Accepted by this tutor */
    const acceptedQuery = query(
      collection(db, "questions"),
      where("status", "==", "accepted"),
      where("acceptedBy", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubOpen = onSnapshot(openQuery, (snapshot) => {
      setOpen(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    const unsubAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      setAccepted(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => {
      unsubOpen();
      unsubAccepted();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // 1. Open questions (Anyone can see these)
    const openQuery = query(
      collection(db, "questions"),
      where("status", "==", "open"),
    );

    // 2. Accepted by THIS particular tutor
    // NOTE: This requires a Composite Index in Firestore
    const acceptedQuery = query(
      collection(db, "questions"),
      where("status", "==", "accepted"),
      where("acceptedBy", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubOpen = onSnapshot(openQuery, (snapshot) => {
      setOpen(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAccepted = onSnapshot(
      acceptedQuery,
      (snapshot) => {
        setAccepted(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (error) => {
        console.error("Accepted Query Error:", error);
        // If you see an error here about indexes, click the link in the console.
      },
    );

    return () => {
      unsubOpen();
      unsubAccepted();
    };
  }, [user]);

  const handleCompleted = async (questionId) => {
    try {
      const questionRef = doc(db, "questions", questionId);

      await updateDoc(questionRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      console.log("Question marked as completed!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to mark as completed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-16">Tutor Dashboard</h1>

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
                <div
                  className="
                  flex items-center gap-1.5
                  px-3 py-1 rounded-full
                  bg-indigo-500/10 text-indigo-400
                  text-[11px] font-medium
                  border border-indigo-500/20
                "
                >
                  <Clock size={12} />
                  {timeAgo(q.createdAt)}
                </div>
              </div>

              <h2 className="text-xl text-white font-semibold pr-20">
                {q.title}
              </h2>

              <p className="mt-4 text-sm text-zinc-300 line-clamp-3">
                {q.description}
              </p>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate(`/tutor/question/${q.id}`)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  View →
                </button>
              </div>
            </motion.div>
          ))}

          {open.length === 0 && (
            <p className="text-zinc-500 w-full">No open questions right now.</p>
          )}
        </div>
      </section>

      {/* ACCEPTED QUESTIONS */}
      <section>
        <h2 className="text-2xl text-white mb-6">Accepted Questions</h2>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-['Space_Grotesk'] text-white">
            Your Active Sessions
          </h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
            {accepted.length} Active
          </span>
        </div>

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
                  <div
                    className="
                    flex justify-center items-center gap-1.5
                    px-3 py-1 rounded-full
                    bg-emerald-500/10 text-emerald-400
                    text-[11px] font-medium
                    border border-emerald-500/20
                    
                  "
                  >
                    Accepted
                  </div>
                  <div className="mt-7">
                    <button
                      className="
  text-sm font-semibold
  text-white
  px-4 py-2
  rounded-full
  bg-gradient-to-r from-emerald-500 to-green-600
  shadow-md
  hover:from-emerald-600 hover:to-green-700
  hover:shadow-lg
  transition-all duration-200
"
                      onClick={() => handleCompleted(q.id)}
                    >
                      ✓ Completed
                    </button>
                  </div>
                </div>

                <h2 className="text-xl text-white font-semibold pr-20">
                  {q.title}
                </h2>

                <p className="mt-4 text-sm text-zinc-300">{q.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
