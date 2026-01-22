import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

function AdminDashboard() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  // Fetch all tutors from Firestore
  const fetchTutors = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const allTutors = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.role === "Tutor"); // only tutors
      setTutors(allTutors);
    } catch (err) {
      console.error("Error fetching tutors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // Approve a tutor
  const approveTutor = async (id) => {
    setActionLoading(id);
    try {
      const tutorRef = doc(db, "users", id);
      await updateDoc(tutorRef, { isApproved: true });
      fetchTutors();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  // Revoke a tutor (set isApproved to false)
  const revokeTutor = async (id) => {
    setActionLoading(id);
    try {
      const tutorRef = doc(db, "users", id);
      await updateDoc(tutorRef, { isApproved: false });
      fetchTutors();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  // Delete a tutor completely
  const deleteTutor = async (id) => {
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, "users", id));
      fetchTutors();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <p>Loading tutors...</p>
      ) : tutors.length === 0 ? (
        <p>No tutors found</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {tutors.map((tutor) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{tutor.name}</h2>
                  <p className="text-gray-400">{tutor.email}</p>
                  <p className="mt-2">
                    Status:{" "}
                    {tutor.isApproved ? (
                      <span className="text-green-400 font-semibold">Approved</span>
                    ) : (
                      <span className="text-yellow-400 font-semibold">Pending</span>
                    )}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!tutor.isApproved ? (
                    <button
                      disabled={actionLoading === tutor.id}
                      onClick={() => approveTutor(tutor.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {actionLoading === tutor.id ? "Processing..." : "Approve"}
                    </button>
                  ) : (
                    <button
                      disabled={actionLoading === tutor.id}
                      onClick={() => revokeTutor(tutor.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {actionLoading === tutor.id ? "Processing..." : "Revoke"}
                    </button>
                  )}
                  <button
                    disabled={actionLoading === tutor.id}
                    onClick={() => deleteTutor(tutor.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {actionLoading === tutor.id ? "Processing..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
