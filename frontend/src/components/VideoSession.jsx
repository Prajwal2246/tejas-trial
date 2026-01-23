import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function VideoSession({ headerHeight = "h-16", isTutor = true }) {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ---------------- Refs ----------------
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pc = useRef(null);
  const unsubscribers = useRef([]);
  const chatEndRef = useRef(null);
  const joinTimeoutRef = useRef(null);

  // ---------------- State ----------------
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [studentJoined, setStudentJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [studentId, setStudentId] = useState(null);

  // ---------------- Helpers ----------------
  const stopMediaStream = (stream) => {
    if (stream) stream.getTracks().forEach((track) => (track.stop(), (track.enabled = false)));
  };

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

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

  const leaveSession = () => navigate("/"); // redirect to homepage

  // ---------------- Media Setup ----------------
  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

      pc.current.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };

      return stream;
    } catch (err) {
      console.error("Error accessing media:", err);
      return null;
    }
  };

  // ---------------- Chat ----------------
  const setupChatListener = () => {
    const messagesCol = collection(db, "calls", roomId, "messages");
    unsubscribers.current.push(
      onSnapshot(messagesCol, (snap) => {
        const msgs = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setMessages(msgs);
        scrollToBottom();
      })
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

  // ---------------- Tutor: Start Call ----------------
  const startCallToStudent = async () => {
    const callDocRef = doc(db, "calls", roomId);
    const callSnap = await getDoc(callDocRef);
    const callData = callSnap.data();

    if (!callData?.studentId) {
      alert("No student has requested this session.");
      return;
    }

    setStudentId(callData.studentId);
    await setupMedia();
    setCallStarted(true);

    // Create offer
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    await setDoc(callDocRef, {
      tutorId: "currentTutorId",
      studentId: callData.studentId,
      studentJoined: false,
      offer: { type: offer.type, sdp: offer.sdp },
    });

    // ICE candidates
    const offerCandidates = collection(callDocRef, "offerCandidates");
    pc.current.onicecandidate = (e) => e.candidate && addDoc(offerCandidates, e.candidate.toJSON());

    // Listen for student joining
    unsubscribers.current.push(
      onSnapshot(callDocRef, async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.studentJoined && !studentJoined) {
          console.log("Student has joined!");
          setStudentJoined(true);
          clearTimeout(joinTimeoutRef.current);

          if (data.answer) pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));

          setupChatListener();
        }
      })
    );

    // 60s timeout
    joinTimeoutRef.current = setTimeout(() => {
      if (!studentJoined) {
        alert("Student did not join in 60 seconds. Redirecting...");
        leaveSession();
      }
    }, 60000);
  };

  // ---------------- Student: Join Call ----------------
  const studentJoinCall = async () => {
    const stream = await setupMedia();
    if (!stream) return;

    const callDocRef = doc(db, "calls", roomId);
    const callSnap = await getDoc(callDocRef);
    const callData = callSnap.data();

    if (!callData?.offer) {
      alert("Tutor has not started the call yet.");
      return;
    }

    // Mark student joined
    await updateDoc(callDocRef, { studentJoined: true });

    await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    await updateDoc(callDocRef, { answer: { type: answer.type, sdp: answer.sdp } });

    // Listen for ICE
    const offerCandidates = collection(callDocRef, "offerCandidates");
    unsubscribers.current.push(
      onSnapshot(offerCandidates, (snap) => {
        snap.docChanges().forEach((c) => {
          if (c.type === "added") pc.current.addIceCandidate(new RTCIceCandidate(c.doc.data()));
        });
      })
    );

    setupChatListener();
  };

  // ---------------- Stop Session ----------------
  const stopSession = () => {
    if (localStreamRef.current) stopMediaStream(localStreamRef.current);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pc.current) pc.current.close();
    unsubscribers.current.forEach((unsub) => unsub());
    unsubscribers.current = [];
    clearTimeout(joinTimeoutRef.current);
  };

  // ---------------- Lifecycle ----------------
  useEffect(() => {
    if (!isTutor) studentJoinCall();
    return () => stopSession();
  }, []);

  // ---------------- JSX ----------------
  return (
    <main className="flex bg-gray-900 min-h-screen">
      {/* Video Section */}
      <div className="flex-1 flex flex-col p-4 mt-[64px] relative">
        {/* Tutor Call Button */}
        {isTutor && !callStarted && (
          <button
            onClick={startCallToStudent}
            className="mb-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 self-start z-50"
          >
            Call Student
          </button>
        )}

        <div className="flex gap-4 flex-wrap">
          {/* Remote Video */}
          <div className="relative w-64 h-48 rounded-md overflow-hidden border-2 border-gray-700 shadow-lg">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          {/* Local Video */}
          <div className="relative w-48 h-36 rounded-md overflow-hidden border-2 border-gray-700 shadow-lg">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1 flex gap-1">
              <button
                onClick={toggleMic}
                className={`px-2 py-1 text-xs rounded-md text-white ${micOn ? "bg-green-600" : "bg-red-600"}`}
              >
                {micOn ? "Mic On" : "Mic Off"}
              </button>
              <button
                onClick={toggleCam}
                className={`px-2 py-1 text-xs rounded-md text-white ${camOn ? "bg-green-600" : "bg-red-600"}`}
              >
                {camOn ? "Cam On" : "Cam Off"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-96 bg-gray-800 flex flex-col h-screen p-4 mt-[64px]">
        <h2 className="text-white text-lg font-semibold mb-4">Chat</h2>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-[75%] break-words ${
                msg.sender === (isTutor ? "Tutor" : "Student")
                  ? "bg-blue-600 text-white self-end ml-auto"
                  : "bg-gray-700 text-white self-start"
              }`}
            >
              <span className="font-semibold">{msg.sender}: </span>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-3 py-2 rounded-md bg-gray-700 text-white outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
