import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const isStudent = user?.role?.toLowerCase() === "student";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Detect Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const authNavLinks = [
    { name: "Ask a Question", path: "/ask" },
    { name: "My Questions", path: "/all-question-student" },
    { name: "Session History", path: "/sessions" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] h-16"
            : "bg-transparent border-b border-transparent h-24"
        }`}
      >
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          {/* 1. LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white fill-current" />
              {/* Ping Effect */}
              <span className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-75"></span>
              <span className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-cyan-500"></span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Tejas<span className="text-cyan-400">.</span>
            </span>
          </div>

          {/* 2. DESKTOP NAV */}
          {/* 2. DESKTOP NAV */}
          {user && isStudent && (
            <nav className="hidden md:flex items-center gap-8">
              {authNavLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className="cursor-pointer text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </nav>
          )}

          {/* 3. AUTH BUTTONS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-slate-300">
                  Hi,{" "}
                  <span className="text-white font-semibold">{user.name}</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="cursor-pointer px-4 py-2 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-semibold text-slate-300 hover:text-white"
                >
                  Log in
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-bold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* 4. MOBILE TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.header>

      {/* 5. MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-24 px-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-6">
              {user &&
                isStudent &&
                authNavLinks.map((link, i) => (
                  <motion.button
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(link.path)}
                    className="cursor-pointer text-2xl font-bold text-left text-slate-300 hover:text-white hover:pl-4 transition-all cursor-pointer"
                  >
                    {link.name}
                  </motion.button>
                ))}

              <hr className="border-white/10" />
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <p className="text-white font-semibold text-xl">
                      👋 {user.name}
                    </p>

                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full py-4 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
                    >
                      Log In
                    </button>

                    <button
                      onClick={() => navigate("/signup")}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg shadow-blue-500/20"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
