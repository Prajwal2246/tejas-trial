import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Keep mainly for simple interactions
import { Users, CheckCircle, BarChart3, ChevronRight } from "lucide-react";
import "../App.css";

function TutorHomePage() {
  const navigate = useNavigate();

  const quickActions = [
    { label: "View Open Questions", action: () => navigate("/all-question-tutor") },
    { label: "My Sessions", action: () => navigate("/tutor/session-history") },
    { label: "Payment History", action: () => {} },
    { label: "Profile Settings", action: () => {} },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pt-6 px-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-entry">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Tutor Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your sessions and students</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/all-question-tutor")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md"
        >
          Find Questions
        </motion.button>
      </div>

      {/* STATS - CSS Grid Layout (Instant Render) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-entry delay-1">
        <StatCard
          label="Total Sessions"
          value="24"
          icon={<Users className="w-5 h-5" />}
          color="text-blue-400"
        />
        <StatCard
          label="Questions Answered"
          value="142"
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-emerald-400"
        />
        <StatCard
          label="Rating"
          value="4.9"
          icon={<BarChart3 className="w-5 h-5" />}
          color="text-purple-400"
        />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-entry delay-2">
        {/* QUICK ACTIONS */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((item, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={item.action}
                className="flex items-center justify-between p-3 rounded-lg
                           bg-slate-800 hover:bg-slate-700
                           cursor-pointer transition-colors"
              >
                <span className="text-slate-300 text-sm">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* NEXT SESSION */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800
                        flex flex-col justify-center items-center
                        text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Next Session</h3>
          <p className="text-slate-400 text-sm">No upcoming sessions today.</p>
          <button className="text-blue-400 text-sm font-medium">View Calendar</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
          <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
        <div className={`p-2 rounded-lg bg-slate-800 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default TutorHomePage;