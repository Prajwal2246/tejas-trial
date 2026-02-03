import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import {runTransaction,onSnapshot } from "firebase/firestore";

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


useEffect(() => {
  const ref = doc(db, "questions", id);
  
  // Use onSnapshot instead of getDoc for real-time updates
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

  return () => unsubscribe(); // Cleanup listener on unmount
}, [id]);

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
    // We use runTransaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const questionRef = doc(db, "questions", id);
      const questionSnap = await transaction.get(questionRef);

      if (!questionSnap.exists()) {
        throw "Question no longer exists.";
      }

      const questionData = questionSnap.data();

      // 1. THE CRITICAL CHECK: 
      // If status is not 'open', someone else beat us to it.
      if (questionData.status !== "open") {
        throw "Too late! This question has already been accepted.";
      }

      // 2. Prepare the new Call Room document
      const newCallRef = doc(collection(db, "calls"));

      // 3. Perform the Writes
      // Create the call record
      transaction.set(newCallRef, {
        createdAt: serverTimestamp(),
        studentId: questionData.studentId,
        studentName: questionData.studentName || "Anonymous",
        tutorId: user.uid,
        tutorName: user.displayName || "Tutor"
      });

      // Update the question record
      transaction.update(questionRef, {
        status: "accepted",
        acceptedBy: user.uid,
        roomId: newCallRef.id,
        acceptedAt: serverTimestamp(),
      });

      // 4. Success! Navigate the winning tutor to the session
      navigate(`/tutor/session/${newCallRef.id}`);
    });
  } catch (err) {
    console.error("Transaction failed: ", err);
    // You should show a toast or alert to the user here
    alert(err); 
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
                overflow-hidden group cursor-pointer
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
