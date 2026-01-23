import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function VideoSession() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const isMountedRef = useRef(true);
  const pc = useRef(null);
  const unsubscribers = useRef([]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Helper to safely stop any stream
  const stopMediaStream = (stream) => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    }
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // 1. Check if user left while waiting for camera
      if (!isMountedRef.current) {
        stopMediaStream(stream);
        return null;
      }

      // 2. THE FIX: Check if a "Zombie" stream already exists in the ref.
      // If Strict Mode ran twice, 'localStreamRef.current' might hold the 
      // result of the previous async call. We MUST stop it before overwriting.
      if (localStreamRef.current) {
        console.warn("Cleaning up zombie stream before setting new one");
        stopMediaStream(localStreamRef.current);
      }

      // 3. Now it is safe to assign
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      pc.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => {
        if (pc.current) pc.current.addTrack(track, stream);
      });

      pc.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      return stream;
    } catch (err) {
      console.error("Error accessing media:", err);
      return null;
    }
  };

  const startOrJoinCall = async () => {
    // Ensure we don't run this if unmounted
    if (!isMountedRef.current) return;
    
    const stream = await setupMedia();
    if (!stream) return; 

    const callDoc = doc(db, "calls", roomId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    if (!pc.current) return;

    pc.current.onicecandidate = (e) => {
      if (e.candidate) addDoc(offerCandidates, e.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();
    if (!isMountedRef.current || !pc.current) return;

    if (!callData) {
      // Tutor
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      await setDoc(callDoc, { offer: { type: offer.type, sdp: offer.sdp } });

      unsubscribers.current.push(
        onSnapshot(callDoc, (snap) => {
          const data = snap.data();
          if (pc.current && data?.answer && !pc.current.currentRemoteDescription) {
            pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        })
      );
      // ... (Rest of Tutor Logic)
    } else {
      // Student
      await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      await updateDoc(callDoc, { answer: { type: answer.type, sdp: answer.sdp } });
      // ... (Rest of Student Logic)
    }
    
    // Setup listener for candidates (Simplified for brevity, keep your existing logic)
    const candidateCollection = !callData ? answerCandidates : offerCandidates;
    unsubscribers.current.push(
      onSnapshot(candidateCollection, (snap) => {
        if (pc.current) {
           snap.docChanges().forEach((c) => {
            if (c.type === "added") {
              pc.current.addIceCandidate(new RTCIceCandidate(c.doc.data()));
            }
          });
        }
      })
    );
  };

  const stopSession = () => {
    // Stop the media stream securely
    if (localStreamRef.current) {
      stopMediaStream(localStreamRef.current);
      localStreamRef.current = null;
    }
    
    // Also explicitly clear the video element src
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    unsubscribers.current.forEach((unsub) => unsub());
    unsubscribers.current = [];
  };

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

  const leaveSession = () => {
    navigate(-1);
  };

  useEffect(() => {
    isMountedRef.current = true;
    startOrJoinCall();

    return () => {
      isMountedRef.current = false;
      stopSession();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center p-6 gap-6">
      <button
        onClick={leaveSession}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20"
      >
        ← Leave Session
      </button>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        <div className="flex flex-col gap-4 flex-1">
          <div className="rounded-lg border bg-gray-900 shadow-sm p-4 flex flex-col items-center">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-md bg-black"
            />
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={toggleMic}
              className={`px-4 py-2 rounded-md bg-gray-700 text-white ${
                micOn ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {micOn ? "Mic On" : "Mic Off"}
            </button>
            <button
              onClick={toggleCam}
              className={`px-4 py-2 rounded-md bg-gray-700 text-white ${
                camOn ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {camOn ? "Cam On" : "Cam Off"}
            </button>
            <button
              onClick={leaveSession}
              className="px-4 py-2 rounded-md bg-red-600 text-white"
            >
              Leave
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-lg border bg-gray-900 shadow-sm p-4">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-md bg-black"
          />
        </div>
      </div>
    </main>
  );
}