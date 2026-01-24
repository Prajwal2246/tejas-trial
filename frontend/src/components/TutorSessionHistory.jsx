import React, { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare 
} from "lucide-react";
import { motion } from "framer-motion";

/* Helper to format the completion date */
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  return timestamp.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

function TutorSessionHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "questions"),
      where("status", "==", "completed"),
      where("acceptedBy", "==", user.uid),
      orderBy("completedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(docs);
      setLoading(false);
    }, (error) => {
      console.error("History Query Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  
  return (
    <div className="min-h-screen bg-black px-6 py-24 font-['Plus_Jakarta_Sans']">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-bold text-white tracking-tighter">
            Session <span className="text-emerald-500">History</span>
          </h1>
          <p className="text-zinc-500 mt-2">
            Review your completed sessions and student feedback.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-white/5 bg-zinc-900/20 p-20 text-center">
            <p className="text-zinc-500">No completed sessions found yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((session, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={session.id}
                className="group relative flex flex-col md:flex-row items-center justify-between p-8 bg-zinc-900/50 border border-white/10 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  {/* Status Icon */}
                  <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <CheckCircle2 size={28} />
                  </div>
                  
                  {/* Session Details */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                      {session.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-emerald-500" />
                        {formatDate(session.completedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-sky-500" />
                        {session.subject || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Metadata & View */}
                <div className="mt-6 md:mt-0 flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duration</p>
                    <p className="text-white font-bold">{session.duration || "15 min"}</p>
                  </div>
                  
                  <button className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorSessionHistory;