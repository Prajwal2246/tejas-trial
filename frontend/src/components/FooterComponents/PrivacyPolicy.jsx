import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Eye, FileText, Lock, UserCheck, ChevronLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
			title: "Information We Collect",
			icon: <Eye className="w-5 h-5 text-blue-400" />,
			content: [
				"Personal details: Name, email address, and profile picture provided during registration.",
				"Educational data: Questions asked, session transcripts, and learning preferences.",
				"Technical data: IP address, browser type, and device information for security and performance monitoring.",
			],
		},
		{
			title: "How We Use Your Data",
			icon: <FileText className="w-5 h-5 text-purple-400" />,
			content: [
				"To provide and maintain our tutoring services.",
				"To personalize your learning experience and match you with relevant tutors.",
				"To process transactions and send session-related notifications.",
				"To improve platform functionality through anonymous usage analytics.",
			],
		},
		{
			title: "Data Security & Protection",
			icon: <Lock className="w-5 h-5 text-emerald-400" />,
			content: [
				"All data is encrypted in transit using SSL/TLS protocols.",
				"Sensitive information is stored using industry-standard hashing algorithms.",
				"Access to personal data is strictly limited to authorized personnel only.",
			],
		},
		{
			title: "Your Privacy Rights",
			icon: <UserCheck className="w-5 h-5 text-orange-400" />,
			content: [
				"Right to Access: You can request a copy of the personal data we hold about you.",
				"Right to Rectification: You can update your account information at any time.",
				"Right to Erasure: You may request the deletion of your account and associated data.",
			],
		},
	];

	// Animation Variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const sectionVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Background Security Glow */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-4xl mx-auto"
			>
				{/* Back Button */}
				<motion.nav variants={sectionVariants} className="mb-10">
					<button
						onClick={handleBack}
						className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300"
					>
						<ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
						<span className="text-sm font-medium pr-1">Go Back</span>
					</button>
				</motion.nav>

				{/* Header */}
				<motion.div variants={sectionVariants} className="mb-16">
					<div className="flex items-center gap-4 mb-6">
						<div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
							<Shield className="w-10 h-10 text-blue-500" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
							Privacy <span className="text-blue-400">Policy</span>
						</h1>
					</div>
					<p className="text-slate-400 text-lg max-w-2xl border-l-2 border-blue-500/30 pl-6 py-1">
						Effective Date: January 2026. This policy describes how we
						collect, use, and protect your information to ensure a safe
						learning environment.
					</p>
				</motion.div>

				{/* Content Sections */}
				<div className="grid gap-6">
					{sections.map((section, index) => (
						<motion.section
							key={index}
							variants={sectionVariants}
							whileHover={{
								scale: 1.005,
								borderColor: "rgba(59, 130, 246, 0.3)",
							}}
							className="p-8 rounded-[32px] bg-white/5 border border-white/5 backdrop-blur-sm transition-colors duration-500"
						>
							<div className="flex items-center gap-4 mb-6">
								<div className="p-2 rounded-lg bg-white/5">
									{section.icon}
								</div>
								<h2 className="text-2xl font-semibold text-white">
									{section.title}
								</h2>
							</div>
							<ul className="space-y-4">
								{section.content.map((item, i) => (
									<motion.li
										key={i}
										initial={{ opacity: 0, x: -5 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.3 + i * 0.1 }}
										className="flex items-start text-slate-400 text-base leading-relaxed group"
									>
										<span className="mr-4 mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-400 transition-colors shrink-0" />
										{item}
									</motion.li>
								))}
							</ul>
						</motion.section>
					))}
				</div>

				{/* Contact Notice */}
				<motion.div
					variants={sectionVariants}
					className="mt-20 p-8 border-t border-white/5 text-center"
				>
					<p className="text-slate-500 text-sm">
						If you have any questions regarding this policy, please contact
						our data protection officer at
						<span className="text-blue-400 ml-2 cursor-pointer hover:text-blue-300 font-medium underline underline-offset-4 decoration-blue-500/30 transition-colors">
							privacy@platform.com
						</span>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default PrivacyPolicy;
