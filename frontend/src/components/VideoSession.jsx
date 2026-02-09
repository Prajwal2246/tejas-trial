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
  setDoc,
  deleteField,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function VideoSession({
  headerHeight = "pt-16",
  isTutor = true,
}) {
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
  const callActiveRef = useRef(false);

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
  const [sessionStarted, setSessionStarted] = useState(false);

  // ---------------- Logic Helpers ----------------

  const resetCallSignaling = async () => {
    const callDocRef = doc(db, "calls", roomId);

    // Clear SDP
    await updateDoc(callDocRef, {
      offer: deleteField(),
      answer: deleteField(),
    });

    // Clear ICE candidates
    const offerCandidates = await getDocs(
      collection(callDocRef, "offerCandidates"),
    );
    offerCandidates.forEach((c) => deleteDoc(c.ref));

    const answerCandidates = await getDocs(
      collection(callDocRef, "answerCandidates"),
    );
    answerCandidates.forEach((c) => deleteDoc(c.ref));
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];

    if (pc.current && cameraTrack) {
      const sender = pc.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        try {
          await sender.replaceTrack(cameraTrack);
        } catch (err) {
          console.error("Error restoring camera track:", err);
        }
      }
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setIsSharingScreen(false);
  };

  const toggleScreenShare = async () => {
    if (!isSharingScreen) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = stream;
        const screenTrack = stream.getVideoTracks()[0];

        // Replace the video track being sent to the peer
        if (pc.current) {
          const sender = pc.current
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }

        // Update local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle case where user clicks browser's built-in "Stop sharing" button
        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsSharingScreen(true);
      } catch (e) {
        console.error("Screen share error:", e);
      }
    } else {
      await stopScreenShare();
    }
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
  const callDocRef = doc(db, "calls", roomId);

  try {
    await updateDoc(callDocRef, {
      // Don't use 'ended: true' here if you want to rejoin easily.
      // Use 'tutorOnline: false' to signal you left.
      tutorOnline: false,
      lastLeftAt: serverTimestamp(),
    });
  } catch (err) { console.error(err); }

  stopMediaStream();
  navigate(isTutor ? "/tutor-home" : "/student-home");
};

  // ---------------- WebRTC Logic ----------------

  const shouldAttemptReconnect = async () => {
    if (
      callEndedRef.current ||
      manualLeaveRef.current ||
      isReconnectingRef.current
    ) {
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
      if (
        !stream ||
        stream.getTracks().every((t) => t.readyState === "ended")
      ) {
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
        setConnectionStatus(state || "Disconnected");

        if (
          (state === "failed" || state === "disconnected") &&
          navigator.onLine &&
          callActive
        ) {
          handleReconnection();
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
        console.error("Ice Candidate Error:", err);
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
        console.error("Queue process error:", err);
      }
    }
  };

 const startCallAsTutor = async () => {
  const callDocRef = doc(db, "calls", roomId);

  try {
    // 1. CLEAN RESET (Crucial for Rejoin)
    // We remove the 'if (ended === true)' check that was blocking you.
    // This call forces the room to re-open and wipes old connection data.
    await setDoc(
      callDocRef,
      {
        createdAt: serverTimestamp(),
        ended: false,         // Re-opens the room for the student
        tutorOnline: true,    // Signals you are present
        offer: deleteField(), // Wipes old offer from previous session
        answer: deleteField(),// Wipes old answer from previous session
      },
      { merge: true }
    );

    // 2. Clear ICE candidates from previous sessions
    await resetCallSignaling();

    // 3. Update Local State
    setSessionStarted(true);
    setCallActive(true);
    if (callActiveRef.current !== undefined) {
      callActiveRef.current = true; 
    }

    // 4. Media Setup
    const stream = await setupMedia();
    if (!stream || !pc.current) {
      console.error("Failed to setup media or PeerConnection");
      return;
    }

    // 5. Create Fresh WebRTC Offer
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    // 6. Push Offer to Firestore
    await updateDoc(callDocRef, {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });

    

    // 7. Listen for Student's Answer
    const unsubAnswer = onSnapshot(callDocRef, async (snap) => {
      const data = snap.data();
      // Only set remote description if we have an answer and haven't set one yet
      if (!pc.current || !data?.answer || pc.current.remoteDescription) return;

      try {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        // Process any ICE candidates that arrived early
        await processCandidateQueue();
      } catch (err) {
        console.error("Error setting remote answer:", err);
      }
    });

    // 8. Listen for Student's ICE Candidates
    const unsubCandidates = onSnapshot(
      collection(callDocRef, "answerCandidates"),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            addCandidate(change.doc.data());
          }
        });
      }
    );

    // Store unsubs for cleanup
    unsubscribers.current.push(unsubAnswer, unsubCandidates);

  } catch (error) {
    console.error("Error in startCallAsTutor:", error);
    alert("Failed to start session. Please refresh and try again.");
  }
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
      if (
        pc.current.signalingState === "stable" &&
        pc.current.remoteDescription
      )
        return;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
      await processCandidateQueue();
    });

    const unsub2 = onSnapshot(
      collection(callDocRef, "answerCandidates"),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") addCandidate(change.doc.data());
        });
      },
    );

    unsubscribers.current.push(unsub1, unsub2);
  };

  const joinCallAsStudent = async () => {
    const callDocRef = doc(db, "calls", roomId);
    setSessionStarted(true);
    setCallActive(true);
    callActiveRef.current = true;

    const unsubscribe = onSnapshot(callDocRef, async (snap) => {
      const data = snap.data();
      
      // 🔥 CHANGE: If there is no offer yet OR tutor is offline, 
      // just stay in this listener and wait. 
      // This allows the UI to show the "Waiting" message.
      if (!data?.offer || data?.ended || data?.tutorOnline === false) return;

      unsubscribe(); // Stop listening once we have a valid offer
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
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(data.offer),
      );
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

  // ---------------- Navigation & Window Listeners ----------------

 useEffect(() => {
  const handleBeforeUnload = (e) => {
    // Only show the popup if the call is active and user didn't click "End Session"
    if (callActiveRef.current && !manualLeaveRef.current) {
      // Modern standard: just call preventDefault()
      e.preventDefault();
      
      // Chrome/Firefox require returnValue to be set to something
      // The actual string is ignored by modern browsers; they show their own message.
      e.returnValue = ""; 
      return "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);

  useEffect(() => {
    if (!callActive) return;

    window.history.pushState(null, document.title, window.location.href);

    const handlePopState = (e) => {
      if (manualLeaveRef.current) return;
      const shouldLeave = window.confirm(
        "Are you sure you want to leave the session?",
      );
      if (shouldLeave) {
        manualLeaveRef.current = true;
        stopMediaStream();
        navigate(isTutor ? "/tutor-home" : "/student-home", { replace: true });
      } else {
        window.history.pushState(null, document.title, window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [callActive, isTutor, navigate]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (callActive && !isReconnectingRef.current) handleReconnection();
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
              (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0),
          );
        setMessages(msgs);
      },
    );

    const unsubCall = onSnapshot(doc(db, "calls", roomId), (snap) => {
  const data = snap.data();
  // Listen for 'tutorOnline: false' to pull the student out
  if (data?.tutorOnline === false && !isTutor) {
    stopMediaStream();
    navigate("/student-home");
  }
});

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopMediaStream();
      // setSessionStarted(false);
      setCallActive(false);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !isOnline || connectionStatus !== "connected")
      return;
    await addDoc(collection(db, "calls", roomId, "messages"), {
      text: newMessage,
      sender: isTutor ? "Tutor" : "Student",
      timestamp: serverTimestamp(),
    });
    setNewMessage("");
  };

  const isChatDisabled =
    !isOnline ||
    (connectionStatus !== "connected" && connectionStatus !== "completed");
  const chatPlaceholder = !isOnline
    ? "Offline..."
    : connectionStatus !== "connected" && connectionStatus !== "completed"
      ? "Connecting..."
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

      {/* VIDEO AREA */}
      <section className="flex-[3] flex flex-col relative bg-neutral-950 min-h-0 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="absolute top-4 left-6 z-20 flex gap-2">
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${["connected", "completed"].includes(connectionStatus) ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}
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

            {/* PIP Local Video */}
            <div
              className={`absolute top-4 right-4 transition-all duration-300 border border-white/20 rounded-xl overflow-hidden bg-neutral-800 shadow-2xl z-10 ${isSharingScreen ? "w-48 sm:w-72" : "w-32 sm:w-56"}`}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isSharingScreen ? "scale-x-[-1]" : ""}`}
              />
            </div>

            {!sessionStarted && (
              <div className="absolute inset-0 bg-neutral-950/90 z-30 flex flex-col items-center justify-center text-center p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isTutor
                    ? "Ready to start the lesson?"
                    : "Waiting for tutor..."}
                </h2>
                <button
                  disabled={!isOnline}
                  onClick={isTutor ? startCallAsTutor : joinCallAsStudent}
                  className={`px-10 py-3 rounded-xl font-bold transition-all ${isOnline ? "bg-indigo-600 text-white cursor-pointer" : "bg-neutral-700 text-neutral-500 cursor-not-allowed"}`}
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
            className={`w-12 h-12 flex items-center rounded-2xl justify-center ${micOn ? "bg-neutral-800" : "bg-red-500"} text-white cursor-pointer hover:bg-opacity-80`}
          >
            {micOn ? "🎤" : "🔇"}
          </button>
          <button
            onClick={toggleCam}
            className={`w-12 h-12 flex items-center rounded-2xl justify-center ${camOn ? "bg-neutral-800" : "bg-red-500"} text-white cursor-pointer hover:bg-opacity-80`}
          >
            {camOn ? "📹" : "📷"}
          </button>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <button
            onClick={toggleScreenShare}
            className={`px-4 sm:px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isSharingScreen ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-300"} cursor-pointer hover:bg-opacity-80`}
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

      {/* CHAT SIDEBAR */}
      <aside className="flex-1 lg:max-w-sm flex flex-col bg-neutral-900 h-[40vh] lg:h-full">
        <div className="p-4 border-b border-white/5">
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
              className={`p-2.5 rounded-lg transition-colors ${!isChatDisabled ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer" : "bg-neutral-800 text-neutral-600"}`}
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
          {["checking", "new", "disconnected"].includes(connectionStatus) &&
            isOnline &&
            callActive && (
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
