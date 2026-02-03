import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

/* 🔹 Firestore-safe timeAgo helper */
const timeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate();
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hrs ago`;
};

export default function TutorQuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  /* 🔹 Real-time listener for question updates */
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "questions", id);
    
    // This updates the UI immediately if the status changes in the DB
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setQuestion({ id: snap.id, ...snap.data() });
      } else {
        setQuestion(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to question:", error);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, [id]);

  /* 🔹 Accept & Start Session with Transaction */
  const acceptQuestion = async () => {
    if (!user || !question) return;
    setAccepting(true);

    try {
      await runTransaction(db, async (transaction) => {
        const questionRef = doc(db, "questions", id);
        const questionSnap = await transaction.get(questionRef);

        if (!questionSnap.exists()) {
          throw "Question no longer exists.";
        }

        const questionData = questionSnap.data();

        // 1. Check if another tutor already took it
        if (questionData.status !== "open") {
          throw "Too late! This question has already been accepted by someone else.";
        }

        // 2. Prepare the new Call Room
        const newCallRef = doc(collection(db, "calls"));

        // 3. Atomically update both documents
        transaction.set(newCallRef, {
          createdAt: serverTimestamp(),
          studentId: questionData.studentId,
          studentName: questionData.studentName || "Anonymous",
          tutorId: user.uid,
          tutorName: user.displayName || "Tutor"
        });

        transaction.update(questionRef, {
          status: "accepted",
          acceptedBy: user.uid,
          roomId: newCallRef.id,
          acceptedAt: serverTimestamp(),
        });

        // 4. Success: Navigate to the session
        navigate(`/tutor/session/${newCallRef.id}`);
      });
    } catch (err) {
      console.error("Transaction failed: ", err);
      alert(err); // User-friendly notification
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return <p className="text-white p-10 text-center">Loading...</p>;

  if (!question) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <p className="text-red-400 mb-4">Question not found or deleted.</p>
        <button onClick={() => navigate("/all-question-tutor")} className="text-white underline">
          Go Back
        </button>
      </div>
    );
  }

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
        className="
          w-full max-w-4xl
          rounded-3xl border border-white/20
          bg-zinc-900/70 backdrop-blur-xl
          shadow-2xl p-10 space-y-8
          relative overflow-hidden
        "
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
              {question.studentName || "Anonymous"}
            </span>
          </p>

          {/* Accept & Start Session Button */}
          {question.status === "open" ? (
            <button
              onClick={acceptQuestion}
              disabled={accepting}
              className="
                relative inline-flex items-center
                px-8 py-3
                bg-green-500 text-white
                font-semibold rounded-xl
                shadow-lg
                hover:bg-green-600 hover:scale-105
                transition-transform disabled:opacity-50 disabled:scale-100
                active:scale-95 cursor-pointer
              "
            >
              {accepting ? "Starting..." : "Accept & Start Session"}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
               <span className="inline-block px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold w-fit">
                Already Accepted
              </span>
              <p className="text-zinc-500 text-xs">This session is no longer available.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}