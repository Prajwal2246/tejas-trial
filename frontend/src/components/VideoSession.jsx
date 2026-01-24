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
} from "firebase/firestore";
import { db } from "../firebase";

export default function VideoSession({
  headerHeight = "h-16",
  isTutor = true,
}) {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ---------------- Refs ----------------
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pc = useRef(null);
  const unsubscribers = useRef([]);
  const chatEndRef = useRef(null);

  const remoteStream = useRef(new MediaStream());
  const candidateQueue = useRef([]);

  /* screen share */
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const screenStreamRef = useRef(null);

  // ---------------- State ----------------
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callActive, setCallActive] = useState(false); // Used for UI toggle
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Idle");
  const [mediaReady, setMediaReady] = useState(false);

  // ---------------- Helpers ----------------

  const stopMediaStream = () => {
    console.log("Stopping session...");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    unsubscribers.current.forEach((unsub) => unsub());
    unsubscribers.current = [];
    setCallActive(false);
  };

  const leaveSession = async () => {
    // 1. Tell the other peer the session is over via Firestore
    try {
      const callDocRef = doc(db, "calls", roomId);
      await updateDoc(callDocRef, { ended: true });
    } catch (err) {
      console.error("Error signaling session end:", err);
    }

    // 2. Run local cleanup
    stopMediaStream();

    // 3. Navigate away
    if (isTutor) navigate("/tutor-home");
    else navigate("/student-home");
  };

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

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

  // ---------------- WebRTC Logic ----------------

  const setupMedia = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setMediaReady(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      pc.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      pc.current.onconnectionstatechange = () => {
        console.log("Connection State:", pc.current.connectionState);
        setConnectionStatus(pc.current.connectionState);
      };

      // Handle Remote Stream
      pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.current.addTrack(track);
        });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream.current;
        }
      };

      // Send ICE Candidates
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
      console.error("Error accessing media:", err);
      alert("Please allow camera access.");
      return null;
    }
  };

  // Improved Candidate Handling
  const addCandidate = async (candidateData) => {
    if (!pc.current) return;
    // Always queue if remote description isn't set, OR connection is pending
    if (!pc.current.remoteDescription) {
      candidateQueue.current.push(candidateData);
    } else {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidateData));
      } catch (err) {
        console.error("Error adding candidate:", err);
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
        console.error("Queue processing error:", err);
      }
    }
  };

  // ---------------- Tutor Flow ----------------
  const startCallAsTutor = async () => {
    if (callActive) return;
    setCallActive(true);

    await setupMedia();
    const callDocRef = doc(db, "calls", roomId);

    // 1. Create & Send Offer
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    await updateDoc(callDocRef, {
      offer: { type: offer.type, sdp: offer.sdp },
    });

    // 2. Listen for Student Answer
    unsubscribers.current.push(
      onSnapshot(callDocRef, async (snap) => {
        const data = snap.data();
        if (!pc.current || !data?.answer) return;

        if (!pc.current.remoteDescription) {
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await pc.current.setRemoteDescription(rtcSessionDescription);

          // CRITICAL FIX: Fetch Student's existing candidates manually
          // This ensures we catch them if they arrived while we were waiting
          const answerCandidatesCol = collection(
            callDocRef,
            "answerCandidates",
          );
          const candidatesSnap = await getDocs(answerCandidatesCol);
          candidatesSnap.forEach((doc) => addCandidate(doc.data()));

          await processCandidateQueue();
        }
      }),
    );

    // 3. Listen for NEW Student Candidates
    const answerCandidates = collection(callDocRef, "answerCandidates");
    unsubscribers.current.push(
      onSnapshot(answerCandidates, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            addCandidate(change.doc.data());
          }
        });
      }),
    );
  };

  // ---------------- Student Flow ----------------
  const joinCallAsStudent = async () => {
    if (callActive) return;
    setCallActive(true); // Updates UI to show "Connected" state

    const callDocRef = doc(db, "calls", roomId);

    // 1. Listen for Offer
    const unsubscribe = onSnapshot(callDocRef, async (snap) => {
      const data = snap.data();
      if (!data?.offer) return; // Wait for tutor

      unsubscribe(); // Stop listening to offer
      await setupMedia();

      // 2. Set Remote Description
      if (!pc.current.remoteDescription) {
        const rtcSessionDescription = new RTCSessionDescription(data.offer);
        await pc.current.setRemoteDescription(rtcSessionDescription);
      }

      // 3. Create & Send Answer
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      await updateDoc(callDocRef, {
        answer: { type: answer.type, sdp: answer.sdp },
      });

      // 4. Fetch Tutor's EXISTING Candidates
      const offerCandidatesCol = collection(callDocRef, "offerCandidates");
      const candidatesSnap = await getDocs(offerCandidatesCol);
      candidatesSnap.forEach((doc) => addCandidate(doc.data()));

      // 5. Listen for NEW Tutor Candidates
      unsubscribers.current.push(
        onSnapshot(offerCandidatesCol, (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === "added") {
              addCandidate(change.doc.data());
            }
          });
        }),
      );

      await processCandidateQueue();
    });
  };

  // ---------------- Chat Logic ----------------
  const setupChatListener = () => {
    const messagesCol = collection(db, "calls", roomId, "messages");
    unsubscribers.current.push(
      onSnapshot(messagesCol, (snap) => {
        const msgs = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort(
            (a, b) =>
              (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0),
          );
        setMessages(msgs);
        scrollToBottom();
      }),
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const messagesCol = collection(db, "calls", roomId, "messages");
    await addDoc(messagesCol, {
      text: newMessage,
      sender: isTutor ? "Tutor" : "Student",
      timestamp: serverTimestamp(),
    });
    setNewMessage("");
  };

  // ---------------- Screen Sharing ----------------
  const toogleScreenShare = async () => {
    if (!isSharingScreen) {
      try {
        //1.getting the screen sharing stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];

        //2. replace the track in peerconnection
        if (pc.current) {
          const senders = pc.current.getSenders();
          const videoSender = senders.find((s) => s.track.kind === "video");
          if (videoSender) {
            videoSender.replace(screenTrack);
          }
        }

        //3.update local ui stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        //4 handle user clicking stop sharing
        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsSharingScreen(true);
      } catch (error) {
        console.error("screen sharing error: ", error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    //revert to camera stream
    if (pc.current && localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const senders = pc.current.getSenders();
      const videoSender = senders.find((s) => s.track.kind === "video");

      if (videoSender) {
        videoSender.replaceTrack(videoTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    setIsSharingScreen(false);
  };

  // ---------------- Lifecycle ----------------
  useEffect(() => {
    setupChatListener();

    // --- NEW: Global End Session Listener ---
    const callDocRef = doc(db, "calls", roomId);
    const unsubEndSession = onSnapshot(callDocRef, (snap) => {
      const data = snap.data();
      if (data?.ended === true) {
        stopMediaStream();
        // Navigate based on role
        if (isTutor) navigate("/tutor-home");
        else navigate("/student-home");
      }
    });
    unsubscribers.current.push(unsubEndSession);
    // ---------------------------------------

    return () => {
      stopMediaStream();
    };
  }, []);

  // ---------------- Render ----------------
  return (
    <main className="flex bg-gray-900 min-h-screen pt-20">
      <div className="flex-1 flex flex-col p-4 relative">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
          <div className="bg-black/50 text-white px-3 py-1 rounded text-xs">
            Status: {connectionStatus}
          </div>

          <button
            onClick={leaveSession}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-colors"
          >
            End Session
          </button>
        </div>

        {/* START / JOIN OVERLAY */}
        {!callActive && (
          <div className="absolute inset-0 bg-gray-900/80 z-40 flex items-center justify-center">
            <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl">
              <h2 className="text-2xl text-white font-bold mb-4">
                {isTutor ? "Start Your Class" : "Join Your Class"}
              </h2>
              <p className="text-gray-400 mb-6">
                {isTutor
                  ? "Click start to open the room for students."
                  : "Click join to connect to the tutor."}
              </p>
              <button
                onClick={isTutor ? startCallAsTutor : joinCallAsStudent}
                className="px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-full hover:bg-green-500 shadow-xl transition-transform transform hover:scale-105"
              >
                {isTutor ? "Start Session" : "Join Session"}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 flex-wrap justify-center items-center h-full">
          {/* Remote Video */}
          <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Waiting Spinner */}
            {callActive &&
              connectionStatus !== "connected" &&
              connectionStatus !== "completed" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <h3 className="text-white text-xl font-semibold">
                    Connecting...
                  </h3>
                </div>
              )}
            <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-lg text-white font-semibold z-20">
              {isTutor ? "Student" : "Tutor"}
            </div>
          </div>

          {/* Local Video (Floating) */}
          <div className="absolute bottom-8 right-8 w-64 aspect-video bg-gray-800 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl z-50">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {/* Local Controls */}
            <div className="absolute bottom-2 left-2 flex gap-2 z-50">
              <button
                onClick={toggleMic}
                disabled={!mediaReady}
                className={`p-2 rounded-full transition-all ${
                  !mediaReady
                    ? "bg-gray-500 cursor-not-allowed"
                    : micOn
                      ? "bg-gray-700/80 hover:bg-gray-600"
                      : "bg-red-600 hover:bg-red-500"
                } text-white`}
              >
                {micOn ? "🎤" : "❌"}
              </button>
              <button
                onClick={toggleCam}
                disabled={!mediaReady}
                className={`p-2 rounded-full transition-all ${
                  !mediaReady
                    ? "bg-gray-500 cursor-not-allowed"
                    : camOn
                      ? "bg-gray-700/80 hover:bg-gray-600"
                      : "bg-red-600 hover:bg-red-500"
                } text-white`}
              >
                {camOn ? "📷" : "❌"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={toogleScreenShare}
          disabled={!mediaReady}
          className={`p-2 rounded-full transition-all ${
            !mediaReady
              ? "bg-gray-500 cursor-not-allowed"
              : isSharingScreen
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-gray-700/80 hover:bg-gray-600"
          } text-white`}
          title={isSharingScreen ? "Stop Sharing" : "Share Screen"}
        >
          {isSharingScreen ? "⏹️ Stop Share" : "🖥️ Share Screen"}
        </button>
      </div>

      {/* Chat */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shadow-xl z-40">
        <div className="p-6 border-b border-gray-700 bg-gray-800">
          <h2 className="text-white text-lg font-bold">Class Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl text-sm max-w-[85%] break-words shadow-sm ${
                msg.sender === (isTutor ? "Tutor" : "Student")
                  ? "bg-indigo-600 text-white self-end ml-auto rounded-tr-none"
                  : "bg-gray-700 text-gray-100 rounded-tl-none"
              }`}
            >
              <p className="font-bold text-xs opacity-75 mb-1">{msg.sender}</p>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 text-white outline-none border border-gray-600 focus:border-indigo-500 transition-colors"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
