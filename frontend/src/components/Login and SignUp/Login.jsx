import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Zap, ArrowRight, Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

// === PRELOAD FUNCTION ===
// Starts downloading the heavy dashboard files in the background
const preloadDashboards = () => {
  import("../StudentHomePage"); 
  import("../TutorHomePage");
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Trigger preload immediately on mount
  useEffect(() => {
    preloadDashboards();
  }, []);

  /* ---------------- MOUSE / 3D LOGIC ---------------- */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

  const rotateX = useTransform(mouseY, [0, window.innerHeight], [10, -10]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);

  const backgroundX = useTransform(mouseX, [0, window.innerWidth], [20, -20]);
  const backgroundY = useTransform(mouseY, [0, window.innerHeight], [20, -20]);

  const handleMouseMove = (e) => {
    if (loading) return; 
    x.set(e.clientX);
    y.set(e.clientY);
  };

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. FETCH & CACHE ROLE (The Speed Fix)
      // We fetch the user data HERE while the spinner is showing.
      const userDocRef = doc(db, "users", userCred.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
         const userData = userDoc.data();
         
         // SAVE TO LOCAL STORAGE (Phone Memory)
         // This allows the next page to load instantly without checking the DB again.
         localStorage.setItem("userRole", userData.role); 
         // Convert boolean to string for storage
         localStorage.setItem("userApproved", String(userData.isApproved));
         
         // 3. Navigate to Root
         navigate("/"); 
      } else {
         setError("User data not found.");
         setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setLoading(false);

      if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/wrong-password") {
        setError("Invalid Password");
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found"
      ) {
        setError("No User Found. Sign up first.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden perspective-1000"
    >
      {/* BACKGROUND */}
      <motion.div
        style={{ x: backgroundX, y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </motion.div>

      {/* CARD */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-md p-4"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-75 blur-lg animate-shimmer bg-[length:200%_100%]" />

        <div className="relative bg-black/80 backdrop-blur-3xl rounded-[22px] border border-white/10 p-8 shadow-2xl">
          {/* HEADER */}
          <div className="mb-10 text-center">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/5 mb-4"
            >
              <Zap className="w-6 h-6 text-cyan-400 fill-current" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">
              Welcome{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Back
              </span>
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* EMAIL */}
            <div className="group relative">
              <Mail className="absolute left-0 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white focus:outline-none focus:border-cyan-500"
                placeholder="Email"
              />
            </div>

            {/* PASSWORD */}
            <div className="group relative">
              <Lock className="absolute left-0 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 text-white focus:outline-none focus:border-purple-500"
                placeholder="Password"
              />
            </div>

            {/* SUBMIT */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-bold rounded-xl 
             cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
              <ArrowRight className="inline ml-2" size={18} />
            </motion.button>
          </form>

          {/* ERROR */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center mt-4"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              No Account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-white hover:text-cyan-400 underline cursor-pointer"
              >
                Sign Up Here
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;