import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Components
import Layout from "./components/Layout";
import Login from "./components/Login and SignUp/Login";
import Signup from "./components/Login and SignUp/Signup";
import StudentHomePage from "./components/StudentHomePage";
import TutorHomePage from "./components/TutorHomePage";
import AskQuestion from "./components/AskQuestion";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import TutorSessionHistory from "./components/TutorSessionHistory";

// Footer Components

import PrivacyPolicy from "./components/FooterComponents/PrivacyPolicy";

// Question Pages
import AllQuestionsStudent from "./components/AllQuestionsStudent";
import AllQuestionsTutor from "./components/AllQuestionsTutor";
import TutorQuestionDetail from "./components/TutorQuestionDetail";
import StudentQuestionDetail from "./components/StudentQuestionDetail";
import AcceptQuestionPage from "./components/AcceptQuestionPage";

// Video
import VideoSession from "./components/VideoSession";

import "./App.css";
import StudentSessionHistory from "./components/StudentSessionHistory";
import RefundPolicy from "./components/FooterComponents/RefundPolicy";
import AboutUs from "./components/FooterComponents/AboutUs";
import Blog from "./components/FooterComponents/Blog";
import TermsOfUse from "./components/FooterComponents/TermsOfUse";
import CampusProgram from "./components/FooterComponents/CampusProgram";
import ContactUs from "./components/FooterComponents/ContactUs";
import BecomeMentor from "./components/FooterComponents/BecomeMentor";
import HireFromUs from "./components/FooterComponents/HireFromUs";

/* ================= ROOT AUTH HANDLER ================= */
function RootAuthHandler() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					const userDocRef = doc(db, "users", user.uid);
					const userDoc = await getDoc(userDocRef);

					if (userDoc.exists()) {
						const userData = userDoc.data();

						if (userData.role === "Tutor") {
							if (userData.isApproved === false) {
								await signOut(auth);
								setLoading(false);
							} else {
								navigate("/tutor-home");
							}
						} else {
							navigate("/student-home");
						}
					} else {
						setLoading(false);
					}
				} catch (error) {
					console.error(error);
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [navigate]);

	if (loading) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center">
				Loading...
			</div>
		);
	}

	return <Login />;
}

/* ================= MAIN APP ================= */
function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <Layout />,
			children: [
				{ path: "/", element: <RootAuthHandler /> },
				{ path: "/login", element: <Login /> },
				{ path: "/signup", element: <Signup /> },

				/* ---------- HOME ---------- */
				{ path: "/student-home", element: <StudentHomePage /> },
				{
					path: "/tutor-home",
					element: (
						<ProtectedRoute>
							<TutorHomePage />
						</ProtectedRoute>
					),
				},
				{
					path: "/tutor/session-history",
					element: (
						<ProtectedRoute>
							<TutorSessionHistory />
						</ProtectedRoute>
					),
				},
				{
					path: "/student-session-history",
					element: (
						<ProtectedRoute>
							<StudentSessionHistory />
						</ProtectedRoute>
					),
				},

				/* ---------- FEATURES ---------- */
				{ path: "/ask", element: <AskQuestion /> },

				/* ---------- FOOTER ---------- */
				{ path: "/admin", element: <AdminDashboard /> },
				{ path: "/blog", element: <Blog></Blog> },
				{ path: "/contact-us", element: <ContactUs /> },
				{ path: "/refund-policy", element: <RefundPolicy /> },
				{ path: "/become-mentor", element: <BecomeMentor /> },
				{ path: "/privacy", element: <PrivacyPolicy /> },
				{ path: "/terms", element: <TermsOfUse /> },
				{ path: "/about-us", element: <AboutUs /> },
				{ path: "/campus-program", element: <CampusProgram /> },
				{ path: "/hire-from-us", element: <HireFromUs /> },

				/* ---------- QUESTIONS ---------- */
				{ path: "/all-question-student", element: <AllQuestionsStudent /> },
				{ path: "/all-question-tutor", element: <AllQuestionsTutor /> },

				{ path: "/student/question/:id", element: <StudentQuestionDetail /> },
				{ path: "/tutor/question/:id", element: <TutorQuestionDetail /> },
				{
					path: "/tutor/question/:id/accept",
					element: <AcceptQuestionPage />,
				},

				/* ---------- VIDEO SESSION ---------- */
				// STUDENT joins
				{
					path: "/session/:roomId",
					element: <VideoSession isTutor={false} />,
				},

				// TUTOR joins
				{
					path: "/tutor/session/:roomId",
					element: <VideoSession isTutor={true} />,
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}

export default App;