// pages/StudentChat.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	collection,
	query,
	orderBy,
	onSnapshot,
	addDoc,
	serverTimestamp,
	writeBatch,
	doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Send } from "lucide-react";

export default function StudentChat() {
	const { sessionId } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const messagesEndRef = useRef(null);

	// 1. Fetch messages in real time
	useEffect(() => {
		if (!sessionId) return;
		const messagesRef = collection(db, "questions", sessionId, "messages");
		const q = query(messagesRef, orderBy("timestamp", "asc"));
		return onSnapshot(q, (snap) => {
			setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
		});
	}, [sessionId]);

	// 2. Mark ALL messages as read (batch write)
	useEffect(() => {
		if (!user?.uid || !sessionId || messages.length === 0) return;

		const batch = writeBatch(db);
		let needsCommit = false;

		messages.forEach((msg) => {
			// Don't mark own messages – they are already "read" by you
			if (msg.senderId === user.uid) return;
			// If user not in readBy array, add them
			if (!(msg.readBy || []).includes(user.uid)) {
				const msgRef = doc(db, "questions", sessionId, "messages", msg.id);
				batch.update(msgRef, {
					readBy: [...(msg.readBy || []), user.uid],
				});
				needsCommit = true;
			}
		});

		if (needsCommit) {
			batch.commit();
		}
	}, [messages, sessionId, user]);

	// 3. Auto-scroll to bottom
	// useEffect(() => {
	// 	messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	// }, [messages]);

	// 4. Send a new message
	const handleSend = async (e) => {
		e.preventDefault();
		if (!newMessage.trim()) return;
		const messagesRef = collection(db, "questions", sessionId, "messages");
		await addDoc(messagesRef, {
			senderId: user.uid,
			content: newMessage,
			timestamp: serverTimestamp(),
			readBy: [], // initially unread for others
		});
		setNewMessage("");
	};

	return (
		<div className="min-h-screen bg-[#050505] text-white flex flex-col">
			{/* Header */}
			<div className="flex items-center gap-4 p-4 border-b border-white/10">
				<button
					onClick={() => navigate(-1)}
					className="p-2 hover:bg-white/5 rounded"
				>
					<ArrowLeft size={20} />
				</button>
				<h1 className="text-xl font-bold">Chat</h1>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((msg) => {
					const isMe = msg.senderId === user.uid;
					return (
						<div
							key={msg.id}
							className={`flex ${isMe ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[70%] rounded-2xl px-4 py-2 ${
									isMe ?
										"bg-sky-500 text-black"
									:	"bg-zinc-800 text-white"
								}`}
							>
								<p className="text-sm">{msg.content}</p>
								<p className="text-[10px] opacity-70 mt-1">
									{msg.timestamp?.toDate().toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<form
				onSubmit={handleSend}
				className="p-4 border-t border-white/10 flex gap-2"
			>
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-sky-500"
				/>
				<button
					type="submit"
					className="p-2 cursor-pointer rounded-full bg-sky-500 text-black hover:bg-sky-400 transition"
				>
					<Send size={20} />
				</button>
			</form>
		</div>
	);
}