import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Award, Search, Code } from "lucide-react";

// Animation Variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: "easeOut" },
	},
};

function HireFromUs() {
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

	const features = [
		{
			icon: <Code className="text-cyan-400" />,
			title: "Vetted Code",
			desc: "Every student passes 50+ hours of live coding tests.",
		},
		{
			icon: <Search className="text-blue-400" />,
			title: "Skill Search",
			desc: "Filter by tech stack, location, and availability.",
		},
		{
			icon: <Award className="text-purple-400" />,
			title: "Zero Hiring Fees",
			desc: "We don't charge recruiters. We charge for success.",
		},
	];

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Ambient Background Glow */}
			<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-4xl mx-auto space-y-12 relative z-10"
			>
				{/* Back Button */}
				<motion.nav variants={itemVariants} className="flex items-center">
					<button
						onClick={handleBack}
						className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
					>
						<ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
						<span className="text-sm font-medium pr-1">Go Back</span>
					</button>
				</motion.nav>

				{/* Hero Section */}
				<motion.div variants={itemVariants} className="text-center space-y-6">
					<h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
						The Top <span className="text-cyan-400">1% Talent.</span>
					</h1>
					<p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
						Access a pool of pre-vetted, industry-ready developers and
						designers trained on real-world projects.
					</p>
				</motion.div>

				{/* Feature Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{features.map((feature, idx) => (
						<motion.div
							key={idx}
							variants={itemVariants}
							whileHover={{
								y: -8,
								backgroundColor: "rgba(255, 255, 255, 0.08)",
								borderColor: "rgba(255, 255, 255, 0.2)",
							}}
							className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-4 transition-all duration-300"
						>
							<div className="p-3 bg-black/40 w-fit rounded-2xl">
								{feature.icon}
							</div>
							<h4 className="text-white font-bold text-lg">
								{feature.title}
							</h4>
							<p className="text-sm text-slate-500 leading-relaxed">
								{feature.desc}
							</p>
						</motion.div>
					))}
				</div>
			</motion.div>
		</div>
	);
}

export default HireFromUs;
