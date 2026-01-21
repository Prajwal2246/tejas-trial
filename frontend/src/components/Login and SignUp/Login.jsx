import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useSpring 
} from "framer-motion";
import { Zap, ArrowRight, Lock, Mail } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- 1. MOUSE MOVE ANIMATION LOGIC ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement values (spring physics)
  const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

  // Calculate rotation based on screen position
  // The card will rotate between -10deg and 10deg
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [10, -10]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);

  // Parallax effect for background blobs (they move opposite to mouse)
  const backgroundX = useTransform(mouseX, [0, window.innerWidth], [20, -20]);
  const backgroundY = useTransform(mouseY, [0, window.innerHeight], [20, -20]);

  function handleMouseMove(event) {
    x.set(event.clientX);
    y.set(event.clientY);
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden perspective-1000"
    >
      
      {/* 2. DYNAMIC BACKGROUND (PARALLAX) */}
      <motion.div 
        style={{ x: backgroundX, y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
         {/* Cyan Blob */}
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
         {/* Purple Blob */}
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
         {/* Noise Overlay */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </motion.div>

      {/* 3. 3D TILT CARD WITH POPUP ENTRANCE */}
      <motion.div
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d" 
        }}
        initial={{ opacity: 0, scale: 0.5, rotateX: 45 }} // Start small and tilted
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}   // End normal
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 0.8 
        }}
        className="relative z-10 w-full max-w-md p-4"
      >
        
        {/* Animated "Liquid" Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-75 blur-lg animate-shimmer bg-[length:200%_100%]" />
        
        {/* Main Card Content */}
        <div className="relative bg-black/80 backdrop-blur-3xl rounded-[22px] border border-white/10 p-8 shadow-2xl overflow-hidden translate-z-10">
          
          {/* Header */}
          <div className="mb-10 text-center relative">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/5 mb-4 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] cursor-pointer"
            >
               <Zap className="w-6 h-6 text-cyan-400 fill-current" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Back</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide uppercase">Enter the System</p>
          </div>

          <form className="space-y-6">
            {/* Input: Email */}
            <div className="group relative">
                <div className="absolute left-0 top-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white placeholder-transparent focus:outline-none focus:border-cyan-500 transition-all peer"
                  placeholder="Email"
                />
                <label className="absolute left-8 top-3 text-slate-500 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-400">
                  Email Address
                </label>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.5)] transition-all duration-500 group-focus-within:w-full" />
            </div>

            {/* Input: Password */}
            <div className="group relative">
                <div className="absolute left-0 top-3 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white placeholder-transparent focus:outline-none focus:border-purple-500 transition-all peer"
                  placeholder="Password"
                />
                <label className="absolute left-8 top-3 text-slate-500 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-purple-400 peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-400">
                  Password
                </label>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-purple-400 shadow-[0_0_10px_2px_rgba(192,132,252,0.5)] transition-all duration-500 group-focus-within:w-full" />
            </div>

            {/* 3D Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); navigate("/student-home"); }}
              className="group relative w-full py-4 bg-white text-black font-bold rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-shadow"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                AUTHENTICATE <ArrowRight size={18} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              No credentials?{" "}
              <button onClick={() => navigate("/signup")} className="text-white font-medium hover:text-cyan-400 underline underline-offset-4 transition-colors">
                Initialize Sequence
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Login;