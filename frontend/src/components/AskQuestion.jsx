import React, { useState, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { Send, HelpCircle, FileText, Hash, Sparkles } from "lucide-react";

function AskQuestion() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- SPOTLIGHT MOUSE TRACKING ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden selection:bg-zinc-800 selection:text-zinc-200"
      onMouseMove={handleMouseMove}
    >
      {/* 1. BACKGROUND NOISE & GRADIENTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* 2. THE SPOTLIGHT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="group relative w-full max-w-3xl rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Spotlight Effect Layer */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.1),
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative z-10 p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: CONTEXT (Static) */}
          <div className="md:col-span-4 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <HelpCircle className="text-white w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Need Help?</h2>
              <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                Connect with an expert tutor instantly. Describe your problem clearly for the best results.
              </p>
            </div>
            
            {/* Stats / Trust Badges */}
            <div className="pt-8 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border border-black bg-zinc-800 flex items-center justify-center text-xs text-white">
                         <span className="opacity-50">Use</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">120+ Tutors Online</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <Sparkles size={12} />
                  <span>AI-Assisted Matching</span>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM (Interactive) */}
          <div className="md:col-span-8">
            <form className="space-y-6">
              
              {/* Input: Subject */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Subject</label>
                <div className="relative group/input">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-indigo-400 transition-colors w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="e.g. Calculus, Organic Chemistry" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  />
                </div>
              </div>

              {/* Input: Question */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Details</label>
                <div className="relative group/input">
                  <FileText className="absolute left-4 top-5 text-zinc-500 group-focus-within/input:text-indigo-400 transition-colors w-4 h-4" />
                  <textarea 
                    rows={6}
                    placeholder="Type your question here... (Markdown supported)" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] resize-none"
                  />
                  {/* Subtle character count or hint */}
                  <div className="absolute bottom-3 right-4 text-[10px] text-zinc-600">
                    MARKDOWN SUPPORTED
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-end gap-4">
                 <button type="button" className="text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
                 <button
                    type="button"
                    onClick={() => setIsSubmitting(!isSubmitting)}
                    className="relative group overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
                 >
                    <span className="relative z-10 flex items-center gap-2">
                       {isSubmitting ? 'Posting...' : 'Post Question'} 
                       {!isSubmitting && <Send size={14} />}
                    </span>
                 </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AskQuestion;