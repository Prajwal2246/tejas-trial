import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	motion,
	useMotionValue,
	useTransform,
	useSpring,
	AnimatePresence,
} from "framer-motion";
import {
	Sparkles,
	ArrowRight,
	Lock,
	Mail,
	User,
	Briefcase,
	GraduationCap,
} from "lucide-react";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Signup() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [role, setRole] = useState("Student");
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	/* ---------------- VALIDATION ---------------- */
	const validate = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Full name is required";
		}

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/* ---------------- ERROR COMPONENT ---------------- */
	const FieldError = ({ message }) => {
		if (!message) return null;

		return (
			<motion.p
				initial={{ opacity: 0, y: -4 }}
				animate={{ opacity: 1, y: 0 }}
				className="mt-1 text-xs text-red-400 font-medium"
			>
				{message}
			</motion.p>
		);
	};

	/* success toast component */
	const SuccessToast = () => (
		<motion.div
			initial={{ opacity: 0, y: 40, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 40 }}
			className="fixed bottom-[200px] right-[30px] z-50"
		>
			<div className="relative bg-black/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-green-400/10" />

				<div className="relative flex items-center gap-4">
					<div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/20">
						<motion.svg
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 300 }}
							width="22"
							height="22"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							className="text-emerald-400"
						>
							<path d="M20 6L9 17l-5-5" />
						</motion.svg>
					</div>

					<div>
						<p className="text-white font-semibold">Account Created</p>
						<p className="text-slate-400 text-sm">
							You’ve been successfully registered
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	);

	/* ---------------- MOUSE / 3D LOGIC ---------------- */
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
	const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

	const rotateX = useTransform(mouseY, [0, window.innerHeight], [10, -10]);
	const rotateY = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);

	const backgroundX = useTransform(mouseX, [0, window.innerWidth], [25, -25]);
	const backgroundY = useTransform(mouseY, [0, window.innerHeight], [25, -25]);

	const handleMouseMove = (e) => {
		x.set(e.clientX);
		y.set(e.clientY);
	};

	/* ---------------- SUBMIT ---------------- */
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		try {
			setLoading(true);

			// 🔐 Create auth user (enforces unique email)
			const userCredentials = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password,
			);

			const user = userCredentials.user;

			// 📦 Store profile using UID
			const userData = {
				name: formData.name,
				email: formData.email,
				role,
				createdAt: serverTimestamp(),
			};

			// 👇 Only tutors need approval
			if (role === "Tutor") {
				userData.isApproved = false;
			}

			await setDoc(doc(db, "users", user.uid), userData);
			await auth.signOut();
			// ✅ reset form
			setFormData({ name: "", email: "", password: "" });
			setRole("Student");
			setErrors({});

			// ✅ success toast (ONLY ONCE)
			setSuccess(true);
			setTimeout(() => setSuccess(false), 4000);
		} catch (err) {
			console.error("firebase error", err);

			if (err.code === "auth/email-already-in-use") {
				setErrors({ email: "Email already registered" });
			} else {
				alert("Something went wrong. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			onMouseMove={handleMouseMove}
			className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden perspective-1000 selection:bg-amber-500/30"
		>
			<AnimatePresence>{success && <SuccessToast />}</AnimatePresence>
			{/* BACKGROUND */}
			<motion.div
				style={{ x: backgroundX, y: backgroundY }}
				className="absolute inset-0 z-0 pointer-events-none"
			>
				<div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-amber-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
				<div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
				<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
			</motion.div>

			{/* CARD */}
			<motion.div
				style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
				initial={{ opacity: 0, scale: 0.5, y: 100 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 150, damping: 15 }}
				className="relative z-10 w-full max-w-md p-4"
			>
				<div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 opacity-75 blur-lg animate-shimmer bg-[length:200%_100%]" />

				<div className="relative bg-black/80 backdrop-blur-3xl rounded-[22px] border border-white/10 p-8 shadow-2xl">
					{/* HEADER */}
					<div className="mb-8 text-center">
						<motion.div
							whileHover={{ rotate: 180, scale: 1.1 }}
							className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-white/5 mb-4"
						>
							<Sparkles className="w-6 h-6 text-amber-400" />
						</motion.div>
						<h2 className="text-3xl font-bold text-white">
							Create{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
								Account
							</span>
						</h2>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{/* ROLE */}
						<div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5 relative">
							<motion.div
								className="absolute top-1 bottom-1 w-[48%] bg-slate-800 rounded-lg border border-white/10"
								animate={{ left: role === "Student" ? "1%" : "51%" }}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 30,
								}}
							/>
							<button
								type="button"
								onClick={() => setRole("Student")}
								className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold cursor-pointer ${
									role === "Student" ? "text-white" : "text-slate-500"
								}`}
							>
								<GraduationCap size={16} /> Student
							</button>
							<button
								type="button"
								onClick={() => setRole("Tutor")}
								className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold cursor-pointer ${
									role === "Tutor" ? "text-white" : "text-slate-500"
								}`}
							>
								<Briefcase size={16} /> Tutor
							</button>
						</div>

						{/* NAME */}
						<div className="relative">
							<User className="absolute left-0 top-3 text-slate-500" />
							<input
								type="text"
								value={formData.name}
								onChange={(e) => {
									setFormData({ ...formData, name: e.target.value });
									setErrors({ ...errors, name: null });
								}}
								className={`w-full bg-transparent border-b py-3 pl-8 pr-4 text-white focus:outline-none ${
									errors.name ? "border-red-500" : (
										"border-slate-700 focus:border-amber-500"
									)
								}`}
								placeholder="Full Name"
							/>
							<FieldError message={errors.name} />
						</div>

						{/* EMAIL */}
						<div className="relative">
							<Mail className="absolute left-0 top-3 text-slate-500" />
							<input
								type="email"
								value={formData.email}
								onChange={(e) => {
									setFormData({ ...formData, email: e.target.value });
									setErrors({ ...errors, email: null });
								}}
								className={`w-full bg-transparent border-b py-3 pl-8 pr-4 text-white focus:outline-none ${
									errors.email ? "border-red-500" : (
										"border-slate-700 focus:border-indigo-500"
									)
								}`}
								placeholder="Email"
							/>
							<FieldError message={errors.email} />
						</div>

						{/* PASSWORD */}
						<div className="relative">
							<Lock className="absolute left-0 top-3 text-slate-500" />
							<input
								type="password"
								value={formData.password}
								onChange={(e) => {
									setFormData({
										...formData,
										password: e.target.value,
									});
									setErrors({ ...errors, password: null });
								}}
								className={`w-full bg-transparent border-b py-3 pl-8 pr-4 text-white focus:outline-none ${
									errors.password ? "border-red-500" : (
										"border-slate-700 focus:border-amber-500"
									)
								}`}
								placeholder="Password"
							/>
							<FieldError message={errors.password} />
						</div>

						{/* SUBMIT */}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							type="submit"
							className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg cursor-pointer"
						>
						    SIGNUP{" "}
							<ArrowRight className="inline ml-2" size={18} />
						</motion.button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-slate-500 text-sm">
							Have an Existing Account?{" "}
							<button
								onClick={() => navigate("/login")}
								className="text-white hover:text-amber-400 underline cursor-pointer"
							>
							   Login Here
							</button>
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

export default Signup;