import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Briefcase, DollarSign } from "lucide-react";

// Animation Variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.2 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function BecomeMentor() {
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
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Background Ambient Glow */}
			<div className="absolute top-1/4 -right-20 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-4xl mx-auto space-y-12 relative z-10"
			>
				<motion.nav variants={itemVariants} className="flex items-center">
					<button
						onClick={handleBack}
						className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
					>
						<ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
						<span className="text-sm font-medium pr-1">Go Back</span>
					</button>
				</motion.nav>

				<motion.div
					variants={itemVariants}
					whileHover={{ scale: 1.01 }}
					className="bg-gradient-to-br from-cyan-500/20 to-transparent p-12 rounded-[40px] border border-cyan-500/20 backdrop-blur-sm transition-colors duration-500 hover:border-cyan-500/40"
				>
					<motion.h1
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
						className="text-5xl font-bold text-white mb-6"
					>
						Share your <br />{" "}
						<span className="text-cyan-400">Expertise.</span>
					</motion.h1>

					<motion.p
						variants={itemVariants}
						className="text-slate-300 max-w-lg mb-8"
					>
						Join a global community of experts. Teach what you love and get
						paid for it, while shaping the next generation of engineers.
					</motion.p>

					<div className="flex flex-wrap gap-8">
						<motion.div
							whileHover={{ y: -5 }}
							className="flex items-center gap-2 text-white font-medium group cursor-default"
						>
							<div className="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
								<DollarSign className="text-cyan-400" />
							</div>
							Competitive Pay
						</motion.div>

						<motion.div
							whileHover={{ y: -5 }}
							className="flex items-center gap-2 text-white font-medium group cursor-default"
						>
							<div className="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
								<Briefcase className="text-cyan-400" />
							</div>
							Flexible Hours
						</motion.div>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
}

export default BecomeMentor;
