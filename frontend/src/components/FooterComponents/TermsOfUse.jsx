import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Scale, UserCheck, ShieldAlert, Copyright } from "lucide-react";

// Animation Variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.12 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

function TermsOfUse() {
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

	const sections = [
		{
			icon: <UserCheck className="w-5 h-5 text-cyan-400" />,
			title: "1. Acceptance of Terms",
			content:
				"By accessing or using the Tejas platform, you agree to be bound by these Terms of Use and all applicable laws and regulations.",
		},
		{
			icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
			title: "2. User Conduct",
			content:
				"Users are prohibited from using the platform for any unlawful purpose, including harassment, data scraping, or attempting to bypass security measures.",
		},
		{
			icon: <Copyright className="w-5 h-5 text-emerald-400" />,
			title: "3. Intellectual Property",
			content:
				"All content, logos, and software on this platform are the exclusive property of Tejas. You may not reproduce or distribute any materials without prior consent.",
		},
	];

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Background Accent */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-3xl mx-auto space-y-8 relative z-10"
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

				{/* Header Section */}
				<motion.header variants={itemVariants} className="space-y-4">
					<motion.div
						whileHover={{ rotate: [0, -10, 10, 0] }}
						className="inline-flex items-center justify-center p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-2"
					>
						<Scale className="w-8 h-8 text-cyan-500" />
					</motion.div>
					<h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
						Terms of <span className="text-cyan-400">Use</span>
					</h1>
					<p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
						Last updated: January 2026
					</p>
				</motion.header>

				{/* Legal Sections */}
				<div className="space-y-6">
					{sections.map((section, idx) => (
						<motion.div
							key={idx}
							variants={itemVariants}
							whileHover={{
								scale: 1.01,
								backgroundColor: "rgba(255, 255, 255, 0.08)",
								borderColor: "rgba(34, 211, 238, 0.2)",
							}}
							className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-4 transition-all duration-300 cursor-default"
						>
							<div className="flex items-center gap-4">
								<div className="p-2 bg-black/30 rounded-lg">
									{section.icon}
								</div>
								<h2 className="text-xl font-semibold text-white">
									{section.title}
								</h2>
							</div>
							<p className="text-slate-400 leading-relaxed text-base pl-1">
								{section.content}
							</p>
						</motion.div>
					))}
				</div>

				{/* Footer Acknowledgement */}
				<motion.p
					variants={itemVariants}
					className="text-center text-slate-600 text-xs pt-8"
				>
					By using this service, you acknowledge that you have read and
					understood our policies.
				</motion.p>
			</motion.div>
		</div>
	);
}

export default TermsOfUse;
