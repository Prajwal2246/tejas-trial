import React, { useRef } from "react";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const Layout = () => {
  const { scrollY } = useScroll();
  const location = useLocation(); // Used to trigger animations on route change

  // --- PARALLAX EFFECTS ---
  // Background blobs move slower than the content (parallax)
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  
  // Smooth out the parallax movement
  const smoothY1 = useSpring(y1, { stiffness: 50, damping: 20 });
  const smoothY2 = useSpring(y2, { stiffness: 50, damping: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-200 antialiased selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* 1. GLOBAL BACKGROUND ATMOSPHERE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* Parallax Blobs */}
        <motion.div 
            style={{ y: smoothY1 }}
            className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50" 
        />
        <motion.div 
            style={{ y: smoothY2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50" 
        />
        
        {/* SVG Noise Texture (Cinematic Grain) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <Header />

      {/* 2. MAIN CONTENT WITH PAGE TRANSITIONS */}
      {/* key={location.pathname} ensures the animation replays when you switch pages */}
      <motion.main 
        key={location.pathname}
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      >
        <Outlet />
      </motion.main>

      <Footer />
      
      {/* 3. SCROLL PROGRESS BAR (OPTIONAL GLOWING LINE) */}
      <ScrollProgress />
    </div>
  );
};

// Helper Component for the glowing scroll bar at top
const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 origin-left z-[100] shadow-[0_0_10px_rgba(34,211,238,0.7)]"
            style={{ scaleX }}
        />
    );
};

export default Layout;