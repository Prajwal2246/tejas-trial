import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ChevronRight } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const navLinks = [
    { name: "Student", path: "/student-home" },
    { name: "Tutor", path: "/tutor-home" },
    { name: "Ask Question", path: "/ask" },
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
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* 3. AUTH BUTTONS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="group relative px-5 py-2.5 rounded-full overflow-hidden bg-white text-black font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ChevronRight size={14} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
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
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(link.path)}
                  className="text-2xl font-bold text-left text-slate-300 hover:text-white hover:pl-4 transition-all"
                >
                  {link.name}
                </motion.button>
              ))}
              <hr className="border-white/10" />
              <div className="flex flex-col gap-4">
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;