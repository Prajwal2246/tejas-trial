import React, { lazy, Suspense, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// ===== EAGER (critical) =====
import Layout from "./components/Layout";
import Login from "./components/Login and SignUp/Login";
import Signup from "./components/Login and SignUp/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

// ===== LAZY LOADED =====

// Home
const StudentHomePage = lazy(() => import("./components/StudentHomePage"));
const TutorHomePage = lazy(() => import("./components/TutorHomePage"));

// Sessions
const TutorSessionHistory = lazy(() => import("./components/TutorSessionHistory"));
const StudentSessionHistory = lazy(() => import("./components/StudentSessionHistory"));

// Features
const AskQuestion = lazy(() => import("./components/AskQuestion"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

// Questions
const AllQuestionsStudent = lazy(() => import("./components/AllQuestionsStudent"));
const AllQuestionsTutor = lazy(() => import("./components/AllQuestionsTutor"));
const TutorQuestionDetail = lazy(() => import("./components/TutorQuestionDetail"));
const StudentQuestionDetail = lazy(() => import("./components/StudentQuestionDetail"));
const AcceptQuestionPage = lazy(() => import("./components/AcceptQuestionPage"));

// Video
const VideoSession = lazy(() => import("./components/VideoSession"));

// Footer
const PrivacyPolicy = lazy(() => import("./components/FooterComponents/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./components/FooterComponents/RefundPolicy"));
const AboutUs = lazy(() => import("./components/FooterComponents/AboutUs"));
const Blog = lazy(() => import("./components/FooterComponents/Blog"));
const TermsOfUse = lazy(() => import("./components/FooterComponents/TermsOfUse"));
const CampusProgram = lazy(() => import("./components/FooterComponents/CampusProgram"));
const ContactUs = lazy(() => import("./components/FooterComponents/ContactUs"));
const BecomeMentor = lazy(() => import("./components/FooterComponents/BecomeMentor"));
const HireFromUs = lazy(() => import("./components/FooterComponents/HireFromUs"));

// ===== FALLBACK LOADER =====
const PageLoader = () => (
	<div className="min-h-screen flex items-center justify-center bg-black text-white">
		Loading...
	</div>
);

// ===== ROOT AUTH HANDLER =====
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
				} catch (err) {
					console.error(err);
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [navigate]);

	if (loading) return <PageLoader />;

	return <Login />;
}

// ===== APP =====
function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <Layout />,
			children: [
				{ path: "/", element: <RootAuthHandler /> },
				{ path: "/login", element: <Login /> },
				{ path: "/signup", element: <Signup /> },

				// ---------- HOME ----------
				{
					path: "/student-home",
					element: (
						<Suspense fallback={<PageLoader />}>
							<StudentHomePage />
						</Suspense>
					),
				},
				{
					path: "/tutor-home",
					element: (
						<ProtectedRoute>
							<Suspense fallback={<PageLoader />}>
								<TutorHomePage />
							</Suspense>
						</ProtectedRoute>
					),
				},

				// ---------- SESSIONS ----------
				{
					path: "/tutor/session-history",
					element: (
						<ProtectedRoute>
							<Suspense fallback={<PageLoader />}>
								<TutorSessionHistory />
							</Suspense>
						</ProtectedRoute>
					),
				},
				{
					path: "/student-session-history",
					element: (
						<ProtectedRoute>
							<Suspense fallback={<PageLoader />}>
								<StudentSessionHistory />
							</Suspense>
						</ProtectedRoute>
					),
				},

				// ---------- FEATURES ----------
				{
					path: "/ask",
					element: (
						<Suspense fallback={<PageLoader />}>
							<AskQuestion />
						</Suspense>
					),
				},
				{
					path: "/admin",
					element: (
						<Suspense fallback={<PageLoader />}>
							<AdminDashboard />
						</Suspense>
					),
				},

				// ---------- QUESTIONS ----------
				{
					path: "/all-question-student",
					element: (
						<Suspense fallback={<PageLoader />}>
							<AllQuestionsStudent />
						</Suspense>
					),
				},
				{
					path: "/all-question-tutor",
					element: (
						<Suspense fallback={<PageLoader />}>
							<AllQuestionsTutor />
						</Suspense>
					),
				},
				{
					path: "/student/question/:id",
					element: (
						<Suspense fallback={<PageLoader />}>
							<StudentQuestionDetail />
						</Suspense>
					),
				},
				{
					path: "/tutor/question/:id",
					element: (
						<Suspense fallback={<PageLoader />}>
							<TutorQuestionDetail />
						</Suspense>
					),
				},
				{
					path: "/tutor/question/:id/accept",
					element: (
						<Suspense fallback={<PageLoader />}>
							<AcceptQuestionPage />
						</Suspense>
					),
				},

				// ---------- VIDEO ----------
				{
					path: "/session/:roomId",
					element: (
						<Suspense fallback={<PageLoader />}>
							<VideoSession isTutor={false} />
						</Suspense>
					),
				},
				{
					path: "/tutor/session/:roomId",
					element: (
						<Suspense fallback={<PageLoader />}>
							<VideoSession isTutor={true} />
						</Suspense>
					),
				},

				// ---------- FOOTER ----------
				{
					path: "/blog",
					element: (
						<Suspense fallback={<PageLoader />}>
							<Blog />
						</Suspense>
					),
				},
				{
					path: "/contact-us",
					element: (
						<Suspense fallback={<PageLoader />}>
							<ContactUs />
						</Suspense>
					),
				},
				{
					path: "/refund-policy",
					element: (
						<Suspense fallback={<PageLoader />}>
							<RefundPolicy />
						</Suspense>
					),
				},
				{
					path: "/become-mentor",
					element: (
						<Suspense fallback={<PageLoader />}>
							<BecomeMentor />
						</Suspense>
					),
				},
				{
					path: "/privacy",
					element: (
						<Suspense fallback={<PageLoader />}>
							<PrivacyPolicy />
						</Suspense>
					),
				},
				{
					path: "/terms",
					element: (
						<Suspense fallback={<PageLoader />}>
							<TermsOfUse />
						</Suspense>
					),
				},
				{
					path: "/about-us",
					element: (
						<Suspense fallback={<PageLoader />}>
							<AboutUs />
						</Suspense>
					),
				},
				{
					path: "/campus-program",
					element: (
						<Suspense fallback={<PageLoader />}>
							<CampusProgram />
						</Suspense>
					),
				},
				{
					path: "/hire-from-us",
					element: (
						<Suspense fallback={<PageLoader />}>
							<HireFromUs />
						</Suspense>
					),
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}

export default App;