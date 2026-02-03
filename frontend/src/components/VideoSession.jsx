import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	collection,
	doc,
	updateDoc,
	addDoc,
	onSnapshot,
	serverTimestamp,
	getDocs,
	getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function VideoSession({ headerHeight = "pt-16", isTutor = true }) {
	const { roomId } = useParams();
	const navigate = useNavigate();

	// ---------------- Logic Refs ----------------
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const localStreamRef = useRef(null);
	const pc = useRef(null);
	const unsubscribers = useRef([]);
	const remoteStream = useRef(new MediaStream());
	const candidateQueue = useRef([]);
	const screenStreamRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);
	const isReconnectingRef = useRef(false);
	const callEndedRef = useRef(false);
	const manualLeaveRef = useRef(false);

	// ---------------- State ----------------
	const [micOn, setMicOn] = useState(true);
	const [camOn, setCamOn] = useState(true);
	const [callActive, setCallActive] = useState(false);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [connectionStatus, setConnectionStatus] = useState("Idle");
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [showConflictModal, setShowConflictModal] = useState(false);
	const [isSharingScreen, setIsSharingScreen] = useState(false);

	// ---------------- Logic Helpers ----------------

	const stopScreenShare = () => {
		if (screenStreamRef.current) {
			screenStreamRef.current.getTracks().forEach((track) => track.stop());
			screenStreamRef.current = null;
		}
		if (pc.current && localStreamRef.current) {
			const videoTrack = localStreamRef.current.getVideoTracks()[0];
			const sender = pc.current.getSenders().find((s) => s.track?.kind === "video");
			if (sender && videoTrack) sender.replaceTrack(videoTrack);
			if (localVideoRef.current)
				localVideoRef.current.srcObject = localStreamRef.current;
		}
		setIsSharingScreen(false);
	};

	const cleanupPeerConnection = () => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}
		candidateQueue.current = [];
		if (pc.current) {
			pc.current.close();
			pc.current = null;
		}
	};

	const stopMediaStream = () => {
		stopScreenShare();
		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach((track) => track.stop());
			localStreamRef.current = null;
		}
		cleanupPeerConnection();
		unsubscribers.current.forEach((unsub) => unsub());
		unsubscribers.current = [];
		setCallActive(false);
	};

	const leaveSession = async () => {
		manualLeaveRef.current = true;
		try {
			if (!showConflictModal && isOnline) {
				const callDocRef = doc(db, "calls", roomId);
				await updateDoc(callDocRef, { ended: true });
			}
		} catch (err) {
			console.error("Error leaving session:", err);
		}
		stopMediaStream();
		navigate(isTutor ? "/tutor-home" : "/student-home");
	};

	// ---------------- WebRTC Logic ----------------

	const shouldAttemptReconnect = async () => {
		if (callEndedRef.current || manualLeaveRef.current || isReconnectingRef.current) {
			return false;
		}
		try {
			const callDocRef = doc(db, "calls", roomId);
			const callSnap = await getDoc(callDocRef);
			return callSnap.exists() && !callSnap.data()?.ended;
		} catch (err) {
			return false;
		}
	};

	const handleReconnection = async () => {
		if (!(await shouldAttemptReconnect()) || !callActive) return;
		if (isReconnectingRef.current) return;

		isReconnectingRef.current = true;
		setConnectionStatus("Reconnecting");

		cleanupPeerConnection();
		candidateQueue.current = [];

		if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

		reconnectTimeoutRef.current = setTimeout(async () => {
			try {
				if (isTutor) await restartCallAsTutor();
				else await restartCallAsStudent();
			} finally {
				isReconnectingRef.current = false;
			}
		}, 2000);
	};

	const setupMedia = async () => {
		try {
			let stream = localStreamRef.current;
			if (!stream || stream.getTracks().every((t) => t.readyState === "ended")) {
				stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				localStreamRef.current = stream;
			}

			if (localVideoRef.current && !isSharingScreen) {
				localVideoRef.current.srcObject = stream;
			}

			pc.current = new RTCPeerConnection({
				iceServers: [
					{ urls: "stun:stun.l.google.com:19302" },
					{ urls: "stun:stun1.l.google.com:19302" },
				],
			});

			pc.current.oniceconnectionstatechange = () => {
				const state = pc.current?.iceConnectionState;
				if (!state) return;
				setConnectionStatus(state);

				if (
					(state === "failed" || state === "disconnected") &&
					navigator.onLine &&
					callActive
				) {
					if (!isReconnectingRef.current) {
						handleReconnection();
					}
				}
			};

			pc.current.ontrack = (event) => {
				event.streams[0].getTracks().forEach((track) => {
					remoteStream.current.addTrack(track);
				});
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = remoteStream.current;
				}
			};

			pc.current.onicecandidate = (event) => {
				if (!event.candidate) return;
				const callDocRef = doc(db, "calls", roomId);
				const candidatesCol = collection(
					callDocRef,
					isTutor ? "offerCandidates" : "answerCandidates",
				);
				addDoc(candidatesCol, event.candidate.toJSON());
			};

			stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
			return stream;
		} catch (err) {
			console.error("Media Error:", err);
			return null;
		}
	};

	const addCandidate = async (candidateData) => {
		if (!pc.current) return;
		if (!pc.current.remoteDescription) {
			candidateQueue.current.push(candidateData);
		} else {
			try {
				await pc.current.addIceCandidate(new RTCIceCandidate(candidateData));
			} catch (err) {
				console.error(err);
			}
		}
	};

	const processCandidateQueue = async () => {
		if (!pc.current || !pc.current.remoteDescription) return;
		while (candidateQueue.current.length > 0) {
			const candidate = candidateQueue.current.shift();
			try {
				await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
			} catch (err) {
				console.error(err);
			}
		}
	};

	const startCallAsTutor = async () => {
		const callDocRef = doc(db, "calls", roomId);
		setCallActive(true);
		await setupMedia();
		const offer = await pc.current.createOffer();
		await pc.current.setLocalDescription(offer);
		await updateDoc(callDocRef, {
			offer: { type: offer.type, sdp: offer.sdp },
			ended: false,
		});

		const unsub1 = onSnapshot(callDocRef, async (snap) => {
			const data = snap.data();
			if (!pc.current || !data?.answer || pc.current.remoteDescription) return;
			await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
			const candidatesSnap = await getDocs(
				collection(callDocRef, "answerCandidates"),
			);
			candidatesSnap.forEach((doc) => addCandidate(doc.data()));
			await processCandidateQueue();
		});

		const unsub2 = onSnapshot(collection(callDocRef, "answerCandidates"), (snap) => {
			snap.docChanges().forEach((change) => {
				if (change.type === "added") addCandidate(change.doc.data());
			});
		});

		unsubscribers.current.push(unsub1, unsub2);
	};

	const restartCallAsTutor = async () => {
		const callDocRef = doc(db, "calls", roomId);
		await setupMedia();
		const offer = await pc.current.createOffer({ iceRestart: true });
		await pc.current.setLocalDescription(offer);
		await updateDoc(callDocRef, {
			offer: { type: offer.type, sdp: offer.sdp },
		});

		const unsub1 = onSnapshot(callDocRef, async (snap) => {
			const data = snap.data();
			if (!pc.current || !data?.answer) return;
			if (pc.current.signalingState === "stable" && pc.current.remoteDescription)
				return;
			await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
			await processCandidateQueue();
		});

		const unsub2 = onSnapshot(collection(callDocRef, "answerCandidates"), (snap) => {
			snap.docChanges().forEach((change) => {
				if (change.type === "added") addCandidate(change.doc.data());
			});
		});

		unsubscribers.current.push(unsub1, unsub2);
	};

	const joinCallAsStudent = async () => {
		setCallActive(true);
		const callDocRef = doc(db, "calls", roomId);
		const unsubscribe = onSnapshot(callDocRef, async (snap) => {
			const data = snap.data();
			if (!data?.offer || data?.ended) return;
			unsubscribe();
			await setupMedia();
			if (!pc.current.remoteDescription) {
				await pc.current.setRemoteDescription(
					new RTCSessionDescription(data.offer),
				);
			}
			const answer = await pc.current.createAnswer();
			await pc.current.setLocalDescription(answer);
			await updateDoc(callDocRef, {
				answer: { type: answer.type, sdp: answer.sdp },
			});
			const candidatesSnap = await getDocs(
				collection(callDocRef, "offerCandidates"),
			);
			candidatesSnap.forEach((doc) => addCandidate(doc.data()));

			const unsubCandidates = onSnapshot(
				collection(callDocRef, "offerCandidates"),
				(snap) => {
					snap.docChanges().forEach((change) => {
						if (change.type === "added") addCandidate(change.doc.data());
					});
				},
			);
			unsubscribers.current.push(unsubCandidates);
			await processCandidateQueue();
		});
	};

	const restartCallAsStudent = async () => {
		const callDocRef = doc(db, "calls", roomId);
		const unsubscribe = onSnapshot(callDocRef, async (snap) => {
			const data = snap.data();
			if (!data?.offer || data?.ended) return;
			unsubscribe();
			await setupMedia();
			await pc.current.setRemoteDescription(new RTCSessionDescription(data.offer));
			const answer = await pc.current.createAnswer();
			await pc.current.setLocalDescription(answer);
			await updateDoc(callDocRef, {
				answer: { type: answer.type, sdp: answer.sdp },
			});

			const unsubCandidates = onSnapshot(
				collection(callDocRef, "offerCandidates"),
				(snap) => {
					snap.docChanges().forEach((change) => {
						if (change.type === "added") addCandidate(change.doc.data());
					});
				},
			);
			unsubscribers.current.push(unsubCandidates);
			await processCandidateQueue();
		});
	};

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			if (callActive && !isReconnectingRef.current) {
				handleReconnection();
			}
		};

		const handleOffline = () => setIsOnline(false);

		const handleVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				callActive &&
				navigator.onLine
			) {
				if (
					pc.current?.iceConnectionState === "disconnected" ||
					pc.current?.iceConnectionState === "failed"
				) {
					handleReconnection();
				}
			}
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		const unsubChat = onSnapshot(
			collection(db, "calls", roomId, "messages"),
			(snap) => {
				const msgs = snap.docs
					.map((d) => ({ id: d.id, ...d.data() }))
					.sort(
						(a, b) =>
							(a.timestamp?.toMillis() || 0) -
							(b.timestamp?.toMillis() || 0),
					);
				setMessages(msgs);
			},
		);

		const unsubCall = onSnapshot(doc(db, "calls", roomId), (snap) => {
			const data = snap.data();
			if (data?.ended) {
				callEndedRef.current = true;
				stopMediaStream();
				navigate(isTutor ? "/tutor-home" : "/student-home");
			}
		});

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			stopMediaStream();
		};
	}, [roomId, isTutor, navigate, callActive]);

	const toggleMic = () => {
		if (!localStreamRef.current) return;
		localStreamRef.current.getAudioTracks().forEach((track) => {
			track.enabled = !track.enabled;
			setMicOn(track.enabled);
		});
	};

	const toggleCam = () => {
		if (!localStreamRef.current) return;
		localStreamRef.current.getVideoTracks().forEach((track) => {
			track.enabled = !track.enabled;
			setCamOn(track.enabled);
		});
	};

	const toggleScreenShare = async () => {
		if (!isSharingScreen) {
			try {
				const stream = await navigator.mediaDevices.getDisplayMedia({
					video: true,
				});
				screenStreamRef.current = stream;
				const track = stream.getVideoTracks()[0];
				if (pc.current) {
					const sender = pc.current
						.getSenders()
						.find((s) => s.track && s.track.kind === "video");
					if (sender) await sender.replaceTrack(track);
				}
				if (localVideoRef.current) localVideoRef.current.srcObject = stream;
				track.onended = () => stopScreenShare();
				setIsSharingScreen(true);
			} catch (e) {
				console.error(e);
			}
		} else {
			stopScreenShare();
		}
	};

	const sendMessage = async () => {
		if (!newMessage.trim() || !isOnline || connectionStatus !== "connected") return;
		await addDoc(collection(db, "calls", roomId, "messages"), {
			text: newMessage,
			sender: isTutor ? "Tutor" : "Student",
			timestamp: serverTimestamp(),
		});
		setNewMessage("");
	};

	const isChatDisabled = !isOnline || connectionStatus !== "connected";
	const chatPlaceholder =
		!isOnline ? "Offline..."
		: connectionStatus !== "connected" ? "Connecting..."
		: "Message...";

	return (
		<div
			className={`flex flex-col lg:flex-row w-full h-screen bg-black overflow-hidden ${headerHeight}`}
		>
			{!isOnline && (
				<div className="fixed inset-0 z-[200] bg-red-600/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
					<div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce">
						📡 Offline. Reconnecting...
					</div>
				</div>
			)}

			{/* 1. VIDEO AREA */}
			<section className="flex-[3] flex flex-col relative bg-neutral-950 min-h-0 border-b lg:border-b-0 lg:border-r border-white/10">
				<div className="absolute top-4 left-6 z-20 flex gap-2">
					<div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}
						/>
						<span className="text-[10px] font-bold text-white uppercase tracking-widest">
							{connectionStatus}
						</span>
					</div>
				</div>

				<div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
					<div className="relative w-full h-full max-w-5xl aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
						<video
							ref={remoteVideoRef}
							autoPlay
							playsInline
							className="w-full h-full object-contain"
						/>

						<div
							className={`absolute top-4 right-4 transition-all duration-300 border border-white/20 rounded-xl overflow-hidden bg-neutral-800 shadow-2xl z-10 ${isSharingScreen ? "w-24 sm:w-40" : "w-32 sm:w-56"}`}
						>
							<video
								ref={localVideoRef}
								autoPlay
								muted
								playsInline
								className="w-full h-full object-cover scale-x-[-1]"
							/>
						</div>

						{!callActive &&
							connectionStatus !== "connected" &&
							connectionStatus !== "checking" &&
							connectionStatus != "disconnected" && (
								<div className="absolute inset-0 bg-neutral-950/90 z-30 flex flex-col items-center justify-center text-center p-6">
									<h2 className="text-2xl font-bold text-white mb-6">
										{isTutor ?
											"Ready to start the lesson?"
										:	"Waiting for tutor..."}
									</h2>
									<button
										disabled={!isOnline}
										onClick={
											isTutor ? startCallAsTutor : joinCallAsStudent
										}
										className={`px-10 py-3 rounded-xl font-bold transition-all  ${isOnline ? "bg-indigo-600 text-white cursor-pointer" : "bg-neutral-700 text-neutral-500 cursor-pointer"}`}
									>
										{isTutor ? "Start Session" : "Join Session"}
									</button>
								</div>
							)}
					</div>
				</div>

				{/* CONTROLS */}
				<div className="h-20 sm:h-24 bg-neutral-900/80 backdrop-blur border-t border-white/10 flex items-center justify-center gap-2 sm:gap-6 px-4">
					<button
						onClick={toggleMic}
						className={`w-12 h-12 flex items-center rounded-2xl justify-center ${micOn ? "bg-neutral-800 cursor-pointer" : "bg-red-500 cursor-pointer"} text-white`}
					>
						{micOn ? "🎤" : "🔇"}
					</button>
					<button
						onClick={toggleCam}
						className={`w-12 h-12 flex items-center rounded-2xl justify-center ${camOn ? "bg-neutral-800 cursor-pointer" : "bg-red-500 cursor-pointer"} text-white`}
					>
						{camOn ? "📹" : "📷"}
					</button>
					<div className="w-px h-8 bg-white/10 mx-2" />
					<button
						onClick={toggleScreenShare}
						className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest ${isSharingScreen ? "bg-blue-600 text-white cursor-pointer" : "bg-neutral-800 text-neutral-300 cursor-pointer"}`}
					>
						{isSharingScreen ? "Stop Sharing" : "Share Screen"}
					</button>
					<button
						onClick={leaveSession}
						className="px-4 sm:px-6 py-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer"
					>
						End Session
					</button>
				</div>
			</section>

			{/* 2. CHAT SIDEBAR */}
			<aside className="flex-1 lg:max-w-sm flex flex-col bg-neutral-900 h-[40vh] lg:h-full">
				<div className="p-4 border-b border-white/5 flex items-center justify-between">
					<h2 className="text-white font-black text-[10px] uppercase tracking-widest">
						Classroom Chat
					</h2>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
					{messages.map((msg) => {
						const isMe = msg.sender === (isTutor ? "Tutor" : "Student");
						return (
							<div
								key={msg.id}
								className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
							>
								<span className="text-[8px] font-bold text-neutral-500 mb-1 px-1 uppercase">
									{msg.sender}
								</span>
								<div
									className={`max-w-[85%] p-3 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-neutral-800 text-neutral-200 rounded-tl-none"}`}
								>
									{msg.text}
								</div>
							</div>
						);
					})}
				</div>

				<div className="p-4 bg-neutral-900 border-t border-white/5">
					<div
						className={`flex items-center gap-2 p-1 rounded-xl border ${!isChatDisabled ? "bg-neutral-800 border-white/5" : "opacity-50 bg-neutral-950 border-white/5"}`}
					>
						<input
							type="text"
							disabled={isChatDisabled}
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && sendMessage()}
							placeholder={chatPlaceholder}
							className="flex-1 bg-transparent text-white px-3 py-2 text-sm outline-none placeholder:text-neutral-500"
						/>
						<button
							onClick={sendMessage}
							disabled={isChatDisabled}
							className={`p-2.5 rounded-lg transition-colors ${!isChatDisabled ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer" : "bg-neutral-800 text-neutral-600 cursor-pointer"}`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
							</svg>
						</button>
					</div>
					{connectionStatus !== "connected" && isOnline && callActive && (
						<p className="text-[9px] text-yellow-500 mt-2 text-center uppercase tracking-widest font-bold">
							Establishing Peer Connection...
						</p>
					)}
				</div>
			</aside>

			<style
				dangerouslySetInnerHTML={{
					__html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }`,
				}}
			/>
		</div>
	);
}