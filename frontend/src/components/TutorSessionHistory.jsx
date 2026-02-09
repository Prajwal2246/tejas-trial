import React, { useEffect, useState } from "react";
import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
	doc,
	updateDoc,
	serverTimestamp,
	getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* Date formatter */
const formatDate = (timestamp) => {
	if (!timestamp) return "N/A";
	return timestamp.toDate().toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export default function TutorSessionHistory() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [active, setActive] = useState([]);
	const [completed, setCompleted] = useState([]);
	const [loading, setLoading] = useState(true);

	/* ACTIVE */
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, "questions"),
			where("status", "==", "accepted"),
			where("acceptedBy", "==", user.uid),
			orderBy("createdAt", "desc"),
		);

		return onSnapshot(q, (snap) => {
			setActive(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
		});
	}, [user]);

	/* COMPLETED */
	useEffect(() => {
		if (!user?.uid) return;

		const q = query(
			collection(db, "questions"),
			where("status", "==", "completed"),
			where("acceptedBy", "==", user.uid),
			orderBy("completedAt", "desc"),
		);

		return onSnapshot(q, (snap) => {
			setCompleted(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
			setLoading(false);
		});
	}, [user]);

	const handleCompleted = async (id) => {
		// Mark question completed
		await updateDoc(doc(db, "questions", id), {
			status: "completed",
			completedAt: serverTimestamp(),
		});

		// 🔥 Final hard end of the call (NO MORE REJOINS)
		await updateDoc(doc(db, "calls", id), {
			ended: true,
			endedAt: serverTimestamp(),
			tutorOnline: false,
		});
	};

	const handleJoin = async (id) => {
		const callSnap = await getDoc(doc(db, "calls", id));

		if (!callSnap.exists()) {
			// Tutor can create the call
			navigate(`/tutor/session/${id}`);
			return;
		}

		// 🔥 ONLY block if session was COMPLETED
		if (callSnap.data()?.ended === true) {
			alert("This session has already been completed");
			return;
		}

		// Otherwise allow unlimited rejoin
		navigate(`/tutor/session/${id}`);
	};

	return (
		<div className="min-h-screen bg-black px-6 py-24">
			<div className="max-w-6xl mx-auto">
				{/* ACTIVE */}
				<div className="mb-20">
					<h2 className="text-2xl font-bold text-white mb-6">
						Active Sessions ({active.length})
					</h2>

					{active.length === 0 ?
						<div className="border border-dashed border-white/10 p-10 rounded-2xl text-center text-zinc-500">
							No active sessions
						</div>
					:	<div className="grid gap-6">
							{active.map((s) => (
								<div
									key={s.id}
									className="flex justify-between items-center p-8 bg-zinc-900/60 border border-white/10 rounded-2xl"
								>
									<div>
										<h3 className="text-lg font-bold text-white">
											{s.title}
										</h3>
										<p className="text-sm text-zinc-400 mt-1">
											{s.description}
										</p>
									</div>

									<div className="flex gap-4">
										<button
											onClick={() => handleJoin(s.id)}
											className="px-5 py-2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition"
										>
											Join
										</button>

										<button
											onClick={() => handleCompleted(s.id)}
											className="px-5 py-2 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
										>
											✓ Complete
										</button>
									</div>
								</div>
							))}
						</div>
					}
				</div>

				{/* COMPLETED */}
				<h2 className="text-2xl font-bold text-white mb-6">Completed Sessions</h2>

				{loading ?
					<p className="text-zinc-500">Loading...</p>
				: completed.length === 0 ?
					<div className="border border-dashed border-white/10 p-10 rounded-2xl text-center text-zinc-500">
						No completed sessions
					</div>
				:	<div className="grid gap-6">
						{completed.map((s, i) => (
							<motion.div
								key={s.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: i * 0.05 }}
								className="flex justify-between items-center p-8 bg-zinc-900/50 border border-white/10 rounded-2xl"
							>
								<div className="flex gap-4 items-center">
									<CheckCircle2 className="text-emerald-500" />
									<div>
										<h3 className="text-white font-bold">
											{s.title}
										</h3>
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