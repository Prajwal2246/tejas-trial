import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useSpring 
} from "framer-motion";
import { Sparkles, ArrowRight, Lock, Mail, User, Briefcase, GraduationCap } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [role, setRole] = useState("Student");

  // --- 1. MOUSE MOVE ANIMATION LOGIC ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

  const rotateX = useTransform(mouseY, [0, window.innerHeight], [10, -10]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);

  // Parallax background blobs
  const backgroundX = useTransform(mouseX, [0, window.innerWidth], [25, -25]);
  const backgroundY = useTransform(mouseY, [0, window.innerHeight], [25, -25]);

  function handleMouseMove(event) {
    x.set(event.clientX);
    y.set(event.clientY);
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden perspective-1000 selection:bg-amber-500/30"
    >
      
      {/* 2. DYNAMIC BACKGROUND (SOLAR THEME) */}
      <motion.div 
         style={{ x: backgroundX, y: backgroundY }}
         className="absolute inset-0 z-0 pointer-events-none"
      >
         {/* Amber Blob */}
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-amber-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
         {/* Indigo Blob */}
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </motion.div>

      {/* 3. 3D TILT CARD WITH POPUP ENTRANCE */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 150, 
          damping: 15,
          duration: 0.8
        }}
        className="relative z-10 w-full max-w-md p-4"
      >
        {/* Liquid Border (Amber -> Indigo) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 opacity-75 blur-lg animate-shimmer bg-[length:200%_100%]" />
        
        {/* Main Card */}
        <div className="relative bg-black/80 backdrop-blur-3xl rounded-[22px] border border-white/10 p-8 shadow-2xl overflow-hidden translate-z-10">
          
          <div className="mb-8 text-center relative">
            <motion.div 
               whileHover={{ rotate: 180, scale: 1.1 }}
               className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-white/5 mb-4 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]"
            >
               <Sparkles className="w-6 h-6 text-amber-400 fill-current" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">Account</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide uppercase">Join the Network</p>
          </div>

          <form className="space-y-5">
            {/* Role Switcher */}
            <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5 relative mb-6">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-indigo-500/5" />
                <motion.div 
                    className="absolute top-1 bottom-1 w-[48%] bg-slate-800 rounded-lg border border-white/10 shadow-sm z-0"
                    animate={{ left: role === "Student" ? "1%" : "51%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                    type="button" onClick={() => setRole("Student")}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors duration-300 ${role === "Student" ? "text-white" : "text-slate-500"}`}
                >
                    <GraduationCap size={16} /> Student
                </button>
                <button
                    type="button" onClick={() => setRole("Tutor")}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors duration-300 ${role === "Tutor" ? "text-white" : "text-slate-500"}`}
                >
                    <Briefcase size={16} /> Tutor
                </button>
            </div>

            {/* Input: Name */}
            <div className="group relative">
                <div className="absolute left-0 top-3 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
                  className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white placeholder-transparent focus:outline-none focus:border-amber-500 transition-all peer"
                  placeholder="Full Name"
                />
                <label className="absolute left-8 top-3 text-slate-500 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-amber-400 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-400">
                  Full Name
                </label>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-amber-400 shadow-[0_0_10px_2px_rgba(245,158,11,0.5)] transition-all duration-500 group-focus-within:w-full" />
            </div>

            {/* Input: Email */}
            <div className="group relative">
                <div className="absolute left-0 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
                  className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white placeholder-transparent focus:outline-none focus:border-indigo-500 transition-all peer"
                  placeholder="Email"
                />
                <label className="absolute left-8 top-3 text-slate-500 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-400 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-400">
                  Email Address
                </label>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-indigo-400 shadow-[0_0_10px_2px_rgba(99,102,241,0.5)] transition-all duration-500 group-focus-within:w-full" />
            </div>

            {/* Input: Password */}
            <div className="group relative">
                <div className="absolute left-0 top-3 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required
                  className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white placeholder-transparent focus:outline-none focus:border-amber-500 transition-all peer"
                  placeholder="Password"
                />
                <label className="absolute left-8 top-3 text-slate-500 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-amber-400 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-400">
                  Password
                </label>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-amber-400 shadow-[0_0_10px_2px_rgba(245,158,11,0.5)] transition-all duration-500 group-focus-within:w-full" />
            </div>

            {/* 3D Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); console.log(formData, role); }}
              className="group relative w-full py-4 mt-2 bg-white text-black font-bold rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-shadow"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                INITIATE SEQUENCE <ArrowRight size={18} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-indigo-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Already initialized?{" "}
              <button onClick={() => navigate("/login")} className="text-white font-medium hover:text-amber-400 underline underline-offset-4 transition-colors">
                Access Login
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;