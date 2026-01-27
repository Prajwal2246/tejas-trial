import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Send, Mail, Phone } from "lucide-react";

// Animation Variants
const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInLeft = {
	hidden: { opacity: 0, x: -30 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight = {
	hidden: { opacity: 0, x: 30 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

function ContactUs() {
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
			{/* Background Accent */}
			<div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

			<div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
				{/* Left Column: Info */}
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeInLeft}
					className="space-y-6"
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

					<motion.h1
						variants={fadeInUp}
						className="text-5xl font-bold text-white leading-tight"
					>
						Let's <span className="text-cyan-400">Talk.</span>
					</motion.h1>

					<motion.p variants={fadeInUp} className="text-slate-400 text-lg">
						Have a question or feedback? We’re here to help you navigate your
						journey.
					</motion.p>

					<motion.div variants={fadeInUp} className="space-y-4 pt-4">
						<div className="flex items-center gap-4 text-slate-300 group cursor-pointer">
							<div className="p-3 bg-white/5 rounded-xl group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all duration-300">
								<Mail size={20} />
							</div>{" "}
							support@tejas.com
						</div>
						<div className="flex items-center gap-4 text-slate-300 group cursor-pointer">
							<div className="p-3 bg-white/5 rounded-xl group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all duration-300">
								<Phone size={20} />
							</div>{" "}
							+91 90242 50272
						</div>
					</motion.div>
				</motion.div>

				{/* Right Column: Form */}
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeInRight}
					className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4 backdrop-blur-sm"
				>
					<div className="space-y-4">
						{["Name", "Email"].map((placeholder, idx) => (
							<motion.input
								key={idx}
								whileFocus={{ scale: 1.01 }}
								type={placeholder === "Email" ? "email" : "text"}
								placeholder={placeholder}
								className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 text-white"
							/>
						))}
						<motion.textarea
							whileFocus={{ scale: 1.01 }}
							placeholder="Message"
							rows="4"
							className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 text-white"
						></motion.textarea>
					</div>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-all duration-300 flex justify-center items-center gap-2 group"
					>
						Send Message
						<Send
							size={16}
							className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
						/>
					</motion.button>
				</motion.div>
			</div>
		</div>
	);
}

export default ContactUs;
