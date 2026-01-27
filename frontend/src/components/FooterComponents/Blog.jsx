import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, ChevronRight } from "lucide-react";

// Animation Variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

function Blog() {
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

	const posts = [
		{ title: "The Future of AI in Learning", date: "Jan 20, 2026", tag: "Tech" },
		{ title: "How to Master React in 30 Days", date: "Jan 15, 2026", tag: "Coding" },
		{ title: "Building a Design System", date: "Jan 08, 2026", tag: "Design" },
	];

	return (
		<div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-6 relative overflow-hidden">
			{/* Background Decorative Element */}
			<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="max-w-4xl mx-auto space-y-10 relative z-10"
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

				<motion.h1
					variants={itemVariants}
					className="text-4xl font-bold text-white tracking-tight"
				>
					Latest{" "}
					<span className="text-cyan-400 underline underline-offset-8 decoration-cyan-400/20">
						Insights
					</span>
				</motion.h1>

				<motion.div variants={containerVariants} className="space-y-4">
					{posts.map((post, i) => (
						<motion.div
							key={i}
							variants={itemVariants}
							whileHover={{
								x: 12,
								backgroundColor: "rgba(255, 255, 255, 0.08)",
								borderColor: "rgba(34, 211, 238, 0.3)",
							}}
							className="p-6 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center cursor-pointer group transition-all duration-300"
						>
							<div className="space-y-2">
								<span className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-black">
									{post.tag}
								</span>
								<h3 className="text-xl text-white font-medium group-hover:text-cyan-400 transition-colors duration-300">
									{post.title}
								</h3>
								<div className="flex items-center gap-2 text-slate-500 text-xs">
									<Clock
										size={12}
										className="group-hover:text-cyan-500 transition-colors"
									/>
									{post.date}
								</div>
							</div>

							<div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/0 group-hover:bg-cyan-400/10 transition-all duration-300">
								<ChevronRight className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
							</div>
						</motion.div>
					))}
				</motion.div>
			</motion.div>
		</div>
	);
}

export default Blog;
