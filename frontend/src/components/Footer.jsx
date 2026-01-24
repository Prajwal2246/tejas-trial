import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Twitter,
	Github,
	Linkedin,
	Heart,
	Send,
	MapPin,
	Phone,
	Mail,
} from "lucide-react";

const Footer = () => {
	return (
		<footer className="relative pt-20 pb-10 overflow-hidden border-t border-white/10 bg-[#050505]">
			{/* AMBIENT GLOW BACKGROUND */}
			<div
				className="
					absolute bottom-0 left-1/2 -translate-x-1/2
					w-[600px] h-[280px]
					sm:w-[800px] sm:h-[320px]
					lg:w-[1000px] lg:h-[400px]
					bg-blue-600/10 rounded-full blur-[120px]
					pointer-events-none
				"
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
					{/* BRAND COLUMN */}
					<div className="lg:col-span-4 space-y-6">
						<h2 className="text-3xl font-bold text-white">
							Tejas<span className="text-cyan-400">.</span>
						</h2>

						<p className="text-slate-400 text-sm leading-relaxed max-w-xs">
							Crafting high-performance digital learning solutions with
							precision, clarity, and futuristic design.
						</p>

						{/* Newsletter */}
						<div className="relative w-full max-w-xs mt-4">
							<input
								type="email"
								placeholder="Subscribe to updates"
								className="w-full min-w-0 bg-white/5 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
							/>
							<button className="absolute right-1 top-1 bottom-1 w-10 bg-cyan-500 rounded-full flex items-center justify-center text-black hover:bg-cyan-400 transition-colors">
								<Send size={16} />
							</button>
						</div>

						<div className="flex gap-4 pt-4 flex-wrap">
							<SocialLink href="#" icon={<Twitter size={18} />} />
							<SocialLink href="#" icon={<Github size={18} />} />
							<SocialLink href="#" icon={<Linkedin size={18} />} />
						</div>
					</div>

					{/* LINKS */}
					<div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
						<FooterColumn title="Explore">
							<FooterLink to="/student-home">About Us</FooterLink>
							<FooterLink to="/tutor-home">Blog</FooterLink>
							<FooterLink to="/ask">Campus Program</FooterLink>
							<FooterLink to="/pricing">Become a Mentor</FooterLink>
							<FooterLink to="/pricing">Contact Us</FooterLink>
							<FooterLink to="/pricing">Hire From Us</FooterLink>
						</FooterColumn>

						<FooterColumn title="Useful Links">
							<FooterLink to="/about">Privacy Policy</FooterLink>
							<FooterLink to="/blog">Terms of Use</FooterLink>
							<FooterLink to="/careers">Refund Policy</FooterLink>
						</FooterColumn>

						<div>
							<h3 className="text-white font-bold mb-6 tracking-wide">
								Contact Info
							</h3>

							<ul className="space-y-5">
								<li className="flex items-start gap-3 text-sm opacity-90 text-slate-400">
									<MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
									<p className="text-xs">
										4517 Washington Ave. Manchester, Kentucky 39495
									</p>
								</li>

								<li className="flex items-center gap-3 text-sm opacity-90 text-slate-400">
									<Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
									<p className="text-xs">+91-9024250272</p>
								</li>

								<li className="flex items-center gap-3 text-sm opacity-90 text-slate-400">
									<Mail className="w-4 h-4 flex-shrink-0 text-slate-400" />
									<p className="truncate text-xs">
										shubhammodi820@gmail.com
									</p>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* BOTTOM BAR */}
				<div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-wide text-center sm:text-left">
					<p>
						©️ {new Date().getFullYear()} Tejas Platform. All rights reserved.
					</p>

					<motion.p
						whileHover={{ scale: 1.05 }}
						className="flex items-center gap-1 cursor-default justify-center"
					>
						Made with{" "}
						<Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />{" "}
						in the Matrix
					</motion.p>
				</div>
			</div>
		</footer>
	);
};

// HELPERS

const FooterColumn = ({ title, children }) => (
	<div>
		<h3 className="text-white font-bold mb-6 tracking-wide">{title}</h3>
		<ul className="space-y-4">{children}</ul>
	</div>
);

const FooterLink = ({ to, children }) => (
	<li>
		<Link
			to={to}
			className="text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:pl-2 inline-block text-sm"
		>
			{children}
		</Link>
	</li>
);

const SocialLink = ({ href, icon }) => (
	<motion.a
		whileHover={{
			y: -3,
			backgroundColor: "rgba(34, 211, 238, 0.2)",
			color: "#22d3ee",
		}}
		href={href}
		className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 border border-white/5 transition-colors"
	>
		{icon}
	</motion.a>
);

export default Footer;