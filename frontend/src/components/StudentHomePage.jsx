import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../App.css"; // Ensure you imported the CSS above

function StudentHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pt-6 px-4">
      {/* Hero Section - CSS Animation */}
      <div className="text-center space-y-3 animate-entry">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          Hello, <span className="text-blue-500">{user?.name || "Student"}</span>
        </h1>
        <p className="text-base text-slate-400 max-w-xl mx-auto">
          Ready to learn? Ask a question or review your past sessions.
        </p>
      </div>

      {/* Action Grid - CSS Animation for Layout, Framer for Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="animate-entry delay-1">
          <ActionCard
            icon={<MessageCircle className="w-6 h-6 text-blue-400" />}
            title="Ask a Question"
            desc="Get help from expert tutors instantly."
            label="Start Now"
            onClick={() => navigate("/ask")}
          />
        </div>

        {/* Card 2 */}
        <div className="animate-entry delay-2">
          <ActionCard
            icon={<BookOpen className="w-6 h-6 text-purple-400" />}
            title="My Questions"
            desc="View responses and pending queries."
            label="View All"
            onClick={() => navigate("/all-question-student")}
          />
        </div>

        {/* Card 3 */}
        <div className="animate-entry delay-3">
          <ActionCard
            icon={<Clock className="w-6 h-6 text-emerald-400" />}
            title="Session History"
            desc="Revisit your past learning sessions."
            label="History"
            onClick={() => navigate("/student-session-history")}
          />
        </div>
      </div>
    </div>
  );
}

// Only use Framer Motion for the INTERACTION (Hover/Tap), not the entry.
const ActionCard = ({ icon, title, desc, onClick, label }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative p-5 rounded-xl bg-slate-900 border border-slate-800 
                 active:border-blue-500/50 cursor-pointer transition-colors"

      style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
    >
      <div className="relative z-10 flex flex-col items-start h-full">
        <div className="p-3 rounded-lg bg-slate-800 mb-3">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm mb-4 flex-1">{desc}</p>
        <div className="flex items-center text-blue-400 text-sm font-medium">
          {label} <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </motion.div>
  );
};

export default StudentHomePage;