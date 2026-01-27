import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowLeft, Target, Rocket, Users } from "lucide-react";

// Animation Variants
const fadeInUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
	animate: {
		transition: {
			staggerChildren: 0.2,
		},
	},
};

function AboutUs() {
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

	const values = [
		{
			icon: <Target className="w-8 h-8 text-cyan-400" />,
			title: "Precision",
			desc: "Tailored learning paths for every student.",
			color: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]",
		},
		{
			icon: <Rocket className="w-8 h-8 text-purple-400" />,
			title: "Innovation",
			desc: "Cutting-edge digital classroom technology.",
			color: "group-hover:shadow-[0_0_20px_rgba(192,132,252,0.3)]",
		},
		{
			icon: <Users className="w-8 h-8 text-emerald-400" />,
			title: "Community",
			desc: "A network of elite mentors and eager learners.",
			color: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]",
		},
	];

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Background Decorative Glow */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />

			<motion.div
				initial="initial"
				animate="animate"
				variants={staggerContainer}
				className="max-w-4xl mx-auto space-y-12 relative z-10"
			>
				<nav className="flex items-center">
					<button
						onClick={handleBack}
						className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
					>
						<ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
						<span className="text-sm font-medium pr-1">Go Back</span>
					</button>
				</nav>

				<motion.header variants={fadeInUp} className="text-center space-y-4">
					<h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
						Our{" "}
						<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
							Mission.
						</span>
					</h1>
					<p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-lg">
						Tejas was founded to bridge the gap between traditional education
						and the futuristic demands of the digital economy.
					</p>
				</motion.header>

				<motion.div
					variants={staggerContainer}
					className="grid md:grid-cols-3 gap-6"
				>
					{values.map((v, i) => (
						<motion.div
							key={i}
							variants={fadeInUp}
							whileHover={{ y: -8, scale: 1.02 }}
							className={`group p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20 ${v.color}`}
						>
							<motion.div
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.5 + i * 0.1 }}
								className="flex justify-center"
							>
								<div className="p-3 rounded-2xl bg-black/40 group-hover:scale-110 transition-transform duration-500">
									{v.icon}
								</div>
							</motion.div>
							<h3 className="text-white font-bold text-xl">{v.title}</h3>
							<p className="text-slate-500 text-sm leading-relaxed">
								{v.desc}
							</p>
						</motion.div>
					))}
				</motion.div>

				{/* Optional: Simple Footer/Quote */}
				<motion.div variants={fadeInUp} className="pt-12 text-center">
					<div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto mb-8" />
					<p className="text-slate-500 italic font-light">
						"Empowering the next generation of digital architects."
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}

export default AboutUs;
