import React from "react";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-200 antialiased selection:bg-cyan-500/30 relative">
      
      {/* 1. GLOBAL BACKGROUND (Optimized: Static CSS only) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow Blobs - Using translate3d for GPU isolation */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50" 
          style={{ transform: 'translate3d(0,0,0)' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50" 
          style={{ transform: 'translate3d(0,0,0)' }}
        />
        
        {/* Static Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Header />

      {/* 2. MAIN CONTENT (Optimized: No Scroll Listeners) */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transform: "translateZ(0)" }} /* Forces GPU rendering */
          className="flex-1 relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
      
      {/* 3. SCROLL PROGRESS REMOVED: 
          Deleting the ScrollProgress component frees the main thread 
          from constant scroll-event calculations on mobile. 
      */}
    </div>
  );
};

export default Layout;