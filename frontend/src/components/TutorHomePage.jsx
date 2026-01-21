import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CheckCircle, BarChart3, ChevronRight } from "lucide-react";

function TutorHomePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tutor Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your sessions and students</p>
        </div>
        <button 
          onClick={() => navigate("/ask")} // Assuming tutors view questions here
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          Find Questions
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Sessions" value="24" icon={<Users />} color="text-blue-400" />
        <StatCard label="Questions Answered" value="142" icon={<CheckCircle />} color="text-emerald-400" />
        <StatCard label="Rating" value="4.9" icon={<BarChart3 />} color="text-purple-400" />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-slate-900/50 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            {['View Open Questions', 'My Schedule', 'Payment History', 'Profile Settings'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-white/5 cursor-pointer transition-colors group">
                <span className="text-slate-300 group-hover:text-white transition-colors">{item}</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 flex flex-col justify-center items-center text-center space-y-4"
        >
           <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
           </div>
           <h3 className="text-xl font-bold text-white">Next Session</h3>
           <p className="text-slate-400">You have no upcoming sessions scheduled for today.</p>
           <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View Calendar</button>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <h4 className="text-3xl font-bold text-white mt-2">{value}</h4>
        </div>
        <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default TutorHomePage;