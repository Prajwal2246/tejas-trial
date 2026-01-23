import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function StudentHomePage() {
	const navigate = useNavigate();
	const { user } = useAuth();


	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<div className="w-full max-w-5xl mx-auto space-y-12">
			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center space-y-4 pt-10"
			>
				<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
					Hello,{" "}
					<span className="text-blue-500">{user?.name || "Student"}</span>
				</h1>
				<p className="text-lg text-slate-400 max-w-2xl mx-auto">
					Ready to learn? Ask a question or review your past sessions to keep
					moving forward.
				</p>
			</motion.div>

      {/* Action Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Card 1 */}
        <ActionCard 
          icon={<MessageCircle className="w-6 h-6 text-blue-400" />}
          title="Ask a Question"
          desc="Get help from expert tutors instantly."
          label="Start Now"
          onClick={() => navigate("/ask")}
          delay={0}
        />
        
        {/* Card 2 */}
        <ActionCard 
          icon={<BookOpen className="w-6 h-6 text-purple-400" />}
          title="My Questions"
          desc="View responses and pending queries."
          label="View My Questions"
          onClick={() => navigate("/dashboard")} // Ensure this route exists
          delay={0.1}
        />

        {/* Card 3 */}
        <ActionCard 
          icon={<Clock className="w-6 h-6 text-emerald-400" />}
          title="Session History"
          desc="Revisit your past learning sessions."
          label="View Sessions"
          onClick={() => navigate("/sessions")} // Ensure this route exists
          delay={0.2}
        />
      </motion.div>
    </div>
  );
}

const ActionCard = ({ icon, title, desc, onClick, delay, label }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}   // ✅ USE PROP
      className="
        group relative p-6 rounded-2xl
        bg-slate-900/50 border border-white/10
        hover:border-blue-500/50 cursor-pointer
        transition-colors overflow-hidden
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col items-start h-full">
        <div className="p-3 rounded-lg bg-slate-800/50 mb-4 group-hover:bg-slate-800 transition-colors">
          {icon}
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>

        <p className="text-slate-400 text-sm mb-6 flex-1">
          {desc}
        </p>
        
        <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
          {label} <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </motion.div>
  );
};


export default StudentHomePage;
