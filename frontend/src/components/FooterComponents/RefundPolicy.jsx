import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	ChevronLeft,
	CreditCard,
	RefreshCcw,
	HelpCircle,
	CheckCircle,
} from "lucide-react";

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
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function RefundPolicy() {
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

	const steps = [
		{
			title: "Eligibility",
			desc: "Refunds can be requested within 7 days of the initial purchase for most of our subscription plans.",
			icon: <CheckCircle className="w-5 h-5 text-cyan-400" />,
		},
		{
			title: "Processing",
			desc: "Once approved, refunds are processed within 5-10 business days depending on your bank.",
			icon: <RefreshCcw className="w-5 h-5 text-blue-400" />,
		},
	];

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Background Decorative Glow */}
			<div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-3xl mx-auto space-y-8 relative z-10"
			>
				{/* Navigation */}
				<motion.nav variants={itemVariants} className="flex items-center">
					<button
						onClick={handleBack}
						className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300"
					>
						<ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
						<span className="text-sm font-medium pr-1">Go Back</span>
					</button>
				</motion.nav>

				{/* Header Section */}
				<motion.header variants={itemVariants} className="space-y-4">
					<motion.div
						whileHover={{ scale: 1.1, rotate: 5 }}
						className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-2"
					>
						<CreditCard className="w-8 h-8 text-blue-500" />
					</motion.div>
					<h1 className="text-4xl font-bold text-white tracking-tight">
						Refund <span className="text-blue-500">Policy</span>
					</h1>
					<p className="text-slate-500 text-base border-l border-blue-500/30 pl-4">
						Clear and transparent billing.
					</p>
				</motion.header>

				{/* Policy Cards */}
				<div className="grid gap-6">
					{steps.map((step, idx) => (
						<motion.div
							key={idx}
							variants={itemVariants}
							whileHover={{
								x: 8,
								backgroundColor: "rgba(255, 255, 255, 0.07)",
							}}
							className="p-6 rounded-2xl bg-white/5 border border-white/5 flex gap-5 transition-colors duration-300 group"
						>
							<motion.div
								className="mt-1"
								whileHover={
									step.title === "Processing" ?
										{ rotate: 180 }
									:	{ scale: 1.2 }
								}
								transition={{ duration: 0.5 }}
							>
								{step.icon}
							</motion.div>
							<div>
								<h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
									{step.title}
								</h3>
								<p className="text-slate-400 text-sm leading-relaxed">
									{step.desc}
								</p>
							</div>
						</motion.div>
					))}
				</div>

				{/* Support Box */}
				<motion.div
					variants={itemVariants}
					whileHover={{ scale: 1.02, borderColor: "rgba(34, 211, 238, 0.3)" }}
					className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-white/10 text-center backdrop-blur-sm"
				>
					<HelpCircle className="w-6 h-6 text-slate-500 mx-auto mb-3" />
					<p className="text-sm text-slate-400 leading-relaxed">
						Need help with a payment? Contact our support team at <br />
						<span className="text-white font-medium hover:text-cyan-400 cursor-pointer transition-colors underline underline-offset-4 decoration-white/10">
							support@tejas.com
						</span>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}

export default RefundPolicy;
