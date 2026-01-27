import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, GraduationCap, Zap, Globe } from "lucide-react";

// Animation Variants
const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.2 },
	},
};

function CampusProgram() {
	const navigate = useNavigate();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const handleBack = () => {
		navigate(-1);
		setTimeout(() => {
			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: "smooth",
			});
		}, 100);
	};

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 text-center relative overflow-hidden">
			{/* Background Radial Gradient */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

			<motion.div
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
				className="max-w-3xl mx-auto space-y-8 relative z-10"
			>
				<motion.nav variants={fadeInUp} className="flex items-center">
					<button
						onClick={handleBack}
						className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
					>
						<ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
						<span className="text-sm font-medium pr-1">Go Back</span>
					</button>
				</motion.nav>

				<motion.div
					variants={fadeInUp}
					animate={{ y: [0, -10, 0] }}
					transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
				>
					<GraduationCap className="w-16 h-16 text-cyan-500 mx-auto" />
				</motion.div>

				<motion.h1
					variants={fadeInUp}
					className="text-4xl md:text-5xl font-bold text-white tracking-tight"
				>
					Campus <span className="text-cyan-400">Ambassadors</span>
				</motion.h1>

				<motion.p
					variants={fadeInUp}
					className="text-slate-400 leading-relaxed text-lg"
				>
					Bring Tejas to your university. Empower your peers with the
					best-in-class coding and design mentorship while building your
					leadership profile.
				</motion.p>

				<motion.div
					variants={fadeInUp}
					className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6"
				>
					<motion.div
						whileHover={{
							scale: 1.05,
							backgroundColor: "rgba(255, 255, 255, 0.08)",
						}}
						className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left transition-colors"
					>
						<div className="p-3 rounded-xl bg-yellow-500/10">
							<Zap className="text-yellow-500" />
						</div>
						<div>
							<h4 className="text-white font-bold">Fast-Track</h4>
							<p className="text-xs text-slate-500">
								Priority access to new courses.
							</p>
						</div>
					</motion.div>

					<motion.div
						whileHover={{
							scale: 1.05,
							backgroundColor: "rgba(255, 255, 255, 0.08)",
						}}
						className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left transition-colors"
					>
						<div className="p-3 rounded-xl bg-blue-500/10">
							<Globe className="text-blue-500" />
						</div>
						<div>
							<h4 className="text-white font-bold">Networking</h4>
							<p className="text-xs text-slate-500">
								Connect with global mentors.
							</p>
						</div>
					</motion.div>
				</motion.div>

				<motion.button
					variants={fadeInUp}
					whileHover={{
						scale: 1.05,
						boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)",
					}}
					whileTap={{ scale: 0.95 }}
					className="mt-8 px-10 py-4 bg-cyan-500 text-black font-bold rounded-full hover:bg-cyan-400 transition-all duration-300 shadow-lg"
				>
					Apply Now
				</motion.button>
			</motion.div>
		</div>
	);
}

export default CampusProgram;
