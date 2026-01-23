import { useNavigate, useParams } from "react-router-dom";
import { doc, setDoc, updateDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function AcceptQuestionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth(); // logged-in tutor

  const startSession = async () => {
    if (!user) return;

    try {
      // 1️⃣ Create Firestore call room
      const callDocRef = doc(collection(db, "calls"));
      await setDoc(callDocRef, { createdAt: serverTimestamp() });

      // 2️⃣ Update question in Firestore
      const questionRef = doc(db, "questions", id);
      await updateDoc(questionRef, {
        status: "accepted",
        acceptedBy: user.uid,
        roomId: callDocRef.id,
        acceptedAt: serverTimestamp(),
      });

      // 3️⃣ Navigate to session
      navigate(`/session/${callDocRef.id}`);
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-300 hover:text-black mb-6"
        >
          ← Back to Question
        </button>

        <div className="bg-slate-800 border border-slate-500 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Ready to start the session?</h2>
          <p className="text-slate-400 mb-8">
            This will create a live video room and connect you with the student.
          </p>

          <div className="flex gap-4">
            <button
              onClick={startSession}
              className="bg-black text-white px-6 py-2.5 cursor-pointer rounded-lg hover:bg-slate-600 transition"
            >
              Start Session
            </button>

            <button
              onClick={() => navigate(-1)}
              className="border px-6 py-2.5 rounded-lg font-semibold cursor-pointer outline-none border-slate-500 hover:bg-red-400 transition bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AcceptQuestionPage;
