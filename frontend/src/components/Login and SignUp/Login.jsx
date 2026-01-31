import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

// === PRELOAD FUNCTION ===
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

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. FETCH & CACHE ROLE (The Speed Fix)
      const userDocRef = doc(db, "users", userCred.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
         const userData = userDoc.data();
         
         // SAVE TO LOCAL STORAGE
         localStorage.setItem("userRole", userData.role); 
         localStorage.setItem("userApproved", String(userData.isApproved));
         localStorage.setItem("userName", userData.name || ""); // Add user name for faster display
         localStorage.setItem("userEmail", userData.email || "");
         
         // 3. Navigate directly to the correct page (SKIP the root handler)
         if (userData.role === "Tutor") {
           if (userData.isApproved === false) {
             await auth.signOut();
             setError("Your tutor account is pending approval.");
             setLoading(false);
             return;
           } else {
             navigate("/tutor-home", { replace: true });
           }
         } else {
           navigate("/student-home", { replace: true });
         }
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* SIMPLIFIED BACKGROUND - Much lighter on mobile */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] 
                        bg-cyan-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] 
                        bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      {/* CARD - Simplified animations */}
      <div className="relative z-10 w-full max-w-md p-4 animate-fade-in">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r 
                        from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-md" />

        <div className="relative bg-black/80 backdrop-blur-xl rounded-[22px] 
                        border border-white/10 p-8 shadow-2xl">
          {/* HEADER */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 
                            rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 
                            border border-white/5 mb-4">
              <Zap className="w-6 h-6 text-cyan-400 fill-current" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Welcome{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r 
                             from-cyan-400 to-purple-400">
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
                className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 
                           text-white focus:outline-none focus:border-cyan-500 
                           transition-colors"
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
                className="w-full bg-transparent border-b border-slate-700 py-3 pl-8 pr-4 
                           text-white focus:outline-none focus:border-purple-500 
                           transition-colors"
                placeholder="Password"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-bold rounded-xl 
                         hover:bg-gray-100 active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
              <ArrowRight className="inline ml-2" size={18} />
            </button>
          </form>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm text-center mt-4 animate-fade-in">
              {error}
            </p>
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
      </div>
    </div>
  );
}

export default Login;