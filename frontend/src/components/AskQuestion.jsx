import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Send, HelpCircle, FileText, Hash, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed


export default function AskQuestion() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ get logged-in user

  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mouse tracking for spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleSubmit = async () => {
  if (!subject || !details || !user) return;

  setIsSubmitting(true);

  try {
    await addDoc(collection(db, "questions"), {
      title: subject,
      description: details,
      status: "open",
      acceptedBy: null,

      studentId: user.uid,
      studentName: user.name || "Anonymous",

      createdAt: serverTimestamp(), // 🔥 Firestore timestamp
    });

    navigate("/all-question-student");
  } catch (error) {
    console.error("Error posting question:", error);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <motion.div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Spotlight effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.1),
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative z-10 p-10 grid md:grid-cols-12 gap-12">
          {/* Left info */}
          <div className="md:col-span-4 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <HelpCircle className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Ask a Question</h2>
            <p className="text-zinc-400 text-sm">Get help from expert tutors.</p>
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <Sparkles size={12} /> AI Assisted
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <label className="text-xs text-zinc-500 uppercase">Subject</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-11 text-sm text-white"
                  placeholder="e.g. React, Calculus"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase">Details</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-zinc-500" />
                <textarea
                  rows={6}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-11 text-sm text-white resize-none"
                  placeholder="Explain your question..."
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate("/all-question-student")}
                className="text-sm  text-red-500 hover:text-red-600 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-white cursor-pointer text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                {isSubmitting ? "Posting..." : "Post Question"}
                {!isSubmitting && <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
