import React, { useEffect, useState } from "react";
import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
	doc,
	getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Calendar, CheckCircle2, ChevronRight, BookOpen, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ChatButton from "./ChatButton";

const formatDate = (timestamp) => {
	if (!timestamp) return "Processing...";
	return timestamp.toDate().toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export default function StudentSessionHistory() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [activeSessions, setActiveSessions] = useState([]);
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);

	// 🔹 SESSION MODAL STATE (per session)
	const [sessionModal, setSessionModal] = useState({});

	// ---------------------- FUNCTIONS ----------------------
	const openModal = (sessionId, title, message) => {
		setSessionModal((prev) => ({
			...prev,
			[sessionId]: { open: true, title, message },
		}));

		// auto-close after 3s
		setTimeout(() => {
			setSessionModal((prev) => ({
				...prev,
				[sessionId]: { open: false, title: "", message: "" },
			}));
		}, 3000);
	};

	const handleJoin = async (id) => {
		const callRef = doc(db, "calls", id);
		const callSnap = await getDoc(callRef);

		if (!callSnap.exists() || callSnap.data()?.tutorOnline !== true) {
			openModal(
				id,
				"Tutor Not Available",
				"The tutor hasn’t joined the session yet. Please wait and try again.",
			);
			return;
		}

		if (callSnap.data()?.ended === true) {
			openModal(
				id,
				"Session Completed",
				"This session has already been completed.",
			);
			return;
		}

		navigate(`/student/session/${id}`);
	};

	// ---------------------- FIREBASE DATA ----------------------
	/* ACTIVE SESSIONS */
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, "questions"),
			where("status", "==", "accepted"),
			where("studentId", "==", user.uid),
			orderBy("createdAt", "desc"),
		);

		return onSnapshot(q, (snap) => {
			setActiveSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
		});
	}, [user]);

	/* COMPLETED SESSIONS */
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, "questions"),
			where("status", "==", "completed"),
			where("studentId", "==", user.uid),
			orderBy("completedAt", "desc"),
		);

		return onSnapshot(q, (snap) => {
			setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
			setLoading(false);
		});
	}, [user]);

	// ---------------------- RENDER ----------------------
	return (
		<div className="min-h-screen bg-[#050505] px-6 py-24 text-white relative">
			<div className="max-w-6xl mx-auto">
				{/* HEADER */}
				<div className="mb-20">
					<BookOpen className="text-sky-500 mb-4" />
					<h1 className="text-4xl md:text-6xl font-bold">
						My <span className="text-sky-500">Sessions</span>
					</h1>
				</div>

				{/* ACTIVE SESSIONS */}
				<div className="mb-24 relative">
					<h2 className="text-2xl font-bold mb-6">
						Active Sessions ({activeSessions.length})
					</h2>

					{activeSessions.length === 0 ?
						<div className="border border-dashed border-white/10 p-10 rounded-2xl text-center text-zinc-500">
							No active sessions
						</div>
						: <div className="grid gap-4 relative">
							{activeSessions.map((s, i) => (
								<div key={s.id} className="relative">
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: i * 0.05 }}
										className="flex justify-between items-center p-8 bg-zinc-900/40 border border-white/5 rounded-2xl"
									>
										<div className="flex items-center gap-6">
											<PlayCircle
												className="text-sky-400"
												size={32}
											/>
											<div>
												<h3 className="font-bold">{s.title}</h3>
												<p className="text-sm text-zinc-400">
													Tutor: {s.tutorName || "Expert"}
												</p>
											</div>
										</div>
										<div className="flex gap-3"><ChatButton  sessionId={s.id} role="student" />
											<button
												onClick={() => handleJoin(s.id)}
												className="px-6 cursor-pointer py-3 rounded-full bg-sky-500 text-black font-bold hover:bg-sky-400 transition"
											>
												Join Session
											</button></div>
									</motion.div>

									{/* INLINE MODAL FOR THIS CARD */}
									<AnimatePresence>
										{sessionModal[s.id]?.open && (
											<motion.div
												initial={{ opacity: 0, y: -20 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -20 }}
												transition={{
													duration: 0.25,
													ease: "easeOut",
												}}
												className="absolute -top-20 left-0 right-0 z-10 px-4"
											>
												<div className="flex items-start gap-4 rounded-xl border border-sky-500/30 bg-sky-500/10 px-6 py-4 backdrop-blur relative">
													<div className="mt-1 text-sky-400">
														<PlayCircle size={22} />
													</div>
													<div className="flex-1">
														<h3 className="font-semibold text-sky-300">
															{sessionModal[s.id].title}
														</h3>
														<p className="text-sm text-sky-200/80 mt-1">
															{sessionModal[s.id].message}
														</p>
													</div>
													{/* DISMISS BUTTON */}
													<button
														onClick={() =>
															setSessionModal((prev) => ({
																...prev,
																[s.id]: {
																	open: false,
																	title: "",
																	message: "",
																},
															}))
														}
														className="absolute top-2 right-2 text-sky-300 hover:text-white transition text-sm"
													>
														Dismiss
													</button>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							))}
						</div>
					}
				</div>

				{/* COMPLETED SESSIONS */}
				<h2 className="text-2xl font-bold mb-6">Completed Sessions</h2>
				{loading ?
					<p className="text-zinc-500">Loading...</p>
					: history.length === 0 ?
						<p className="text-zinc-500">No completed sessions yet</p>
						: <div className="grid gap-4">
							{history.map((s, i) => (
								<motion.div
									key={s.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.05 }}
									className="flex justify-between items-center p-8 bg-zinc-900/30 border border-white/5 rounded-2xl"
								>
									<div className="flex items-center gap-4">
										<CheckCircle2 className="text-emerald-500" />
										<div>
											<h3 className="font-bold">{s.title}</h3>
											<p className="text-xs text-zinc-500">
												<Calendar size={12} className="inline mr-1" />
												{formatDate(s.completedAt)}
											</p>
										</div>
									</div>
									<ChevronRight className="text-zinc-500" />
								</motion.div>
							))}
						</div>
				}
			</div>
		</div>
	);
}