import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function AcceptQuestionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const startSession = async () => {
    // 1️⃣ Create Firestore call room
    const callDoc = doc(collection(db, "calls"));
    await setDoc(callDoc, { createdAt: Date.now() });

    // 2️⃣ Update question in localStorage
    const questions = JSON.parse(localStorage.getItem("questions")) || [];

    const updated = questions.map((q) =>
      q.id === Number(id)
        ? {
            ...q,
            status: "accepted",
            acceptedBy: "tutor-1",
            roomId: callDoc.id,
          }
        : q
    );

    localStorage.setItem("questions", JSON.stringify(updated));

    // 3️⃣ Navigate to video session
    navigate(`/session/${callDoc.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      
      {/* 📄 Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 ">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-300 hover:text-black mb-6"
        >
          ← Back to Question
        </button>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-500 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">
            Ready to start the session?
          </h2>

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
