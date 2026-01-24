import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

/* 🔹 Firestore-safe timeAgo */
const timeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate();
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hrs ago`;
};

export default function TutorQuestionDetail() {
  const { id } = useParams(); // Firestore doc id
  const navigate = useNavigate();
  const { user } = useAuth(); // logged-in tutor

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  /* 🔹 Fetch question */
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const ref = doc(db, "questions", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setQuestion({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  /* 🔹 Accept & Start Session */
  const acceptQuestion = async () => {
    if (!user || !question) return;
    setAccepting(true);

    try {
      // 1️⃣ Create Firestore call room with student info
      const callDocRef = doc(collection(db, "calls"));
      await setDoc(callDocRef, {
        createdAt: serverTimestamp(),
        studentId: question.studentId,
        studentName: question.studentName || "Anonymous",
      });

      // 2️⃣ Update question
      const questionRef = doc(db, "questions", id);
      await updateDoc(questionRef, {
        status: "accepted",
        acceptedBy: user.uid,
        roomId: callDocRef.id,
        acceptedAt: serverTimestamp(),
      });

      // 3️⃣ Navigate to video session
      navigate(`/tutor/session/${callDocRef.id}`);
    } catch (err) {
      console.error("Error starting session:", err);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return <p className="text-white p-10 text-center">Loading...</p>;

  if (!question)
    return <p className="text-red-400 p-10 text-center">Question not found</p>;

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
                transition-transform active:scale-95
                overflow-hidden group
              "
            >
              {accepting ? "Starting..." : "Accept & Start Session"}
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
