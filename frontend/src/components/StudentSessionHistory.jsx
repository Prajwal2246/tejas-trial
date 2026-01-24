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
  CheckCircle2, 
  ChevronRight, 
  MessageSquare,
  BookOpen,
  User
} from "lucide-react";
import { motion } from "framer-motion";

/* Helper to format the completion date */
const formatDate = (timestamp) => {
  if (!timestamp) return "Processing...";
  return timestamp.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

function StudentSessionHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // QUERY LOGIC: Filter by 'studentId' and 'status'
    // NOTE: If you sort by 'completedAt', you will need to create a new Composite Index
    // specifically for this query (status + studentId + completedAt).
    const q = query(
      collection(db, "questions"),
      where("status", "==", "completed"),
      where("studentId", "==", user.uid), 
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
      console.error("Student History Fetch Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-24 font-['Plus_Jakarta_Sans'] text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-sky-500/10 p-2 rounded-lg">
              <BookOpen className="text-sky-500 w-5 h-5" />
            </div>
            <span className="text-sky-500 text-xs font-bold uppercase tracking-[0.2em]">Learning Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-['Space_Grotesk'] font-bold tracking-tighter">
            My <span className="text-sky-500">Learning</span> History
          </h1>
          <p className="text-zinc-500 mt-4 text-lg max-w-2xl font-['Plus_Jakarta_Sans']">
            Review all your completed doubts and expert solutions in one place.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            <p className="text-zinc-500 font-medium animate-pulse">Retrieving your sessions...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-white/5 bg-zinc-900/20 p-20 text-center">
            <CheckCircle2 className="mx-auto w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium font-['Space_Grotesk']">You haven't completed any sessions yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((session, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={session.id}
                className="group relative flex flex-col md:flex-row items-center justify-between p-8 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] hover:bg-zinc-900/60 hover:border-sky-500/30 transition-all duration-500"
              >
                <div className="flex items-center gap-8 w-full md:w-auto">
                  {/* Status Icon */}
                  <div className="h-16 w-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-zinc-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shadow-xl">
                    <CheckCircle2 size={32} />
                  </div>
                  
                  {/* Session Details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] group-hover:text-sky-400 transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex flex-wrap gap-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                        <Calendar size={12} className="text-sky-500" />
                        {formatDate(session.completedAt)}
                      </span>
                      <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                        <User size={12} className="text-amber-500" />
                        Tutor: {session.tutorName || "Expert"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side Info */}
                <div className="mt-8 md:mt-0 flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-emerald-400 font-bold font-['Space_Grotesk'] uppercase text-xs">Successfully Resolved</p>
                  </div>
                  
                  <button className="h-14 w-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-sky-500 hover:border-sky-400 transition-all duration-300 group-hover:rotate-45 shadow-lg">
                    <ChevronRight size={24} />
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

export default StudentSessionHistory;