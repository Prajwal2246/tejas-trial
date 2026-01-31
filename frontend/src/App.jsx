import React, { lazy, Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// ===== EAGER IMPORTS (Critical) =====
import Layout from "./components/Layout";
import Login from "./components/Login and SignUp/Login";
import Signup from "./components/Login and SignUp/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

// ===== LAZY LOADED IMPORTS =====

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

// Footer Pages
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
        <p className="animate-pulse">Loading QuizMeBro...</p>
    </div>
);

// ===== ROOT AUTH HANDLER (OPTIMIZED) =====
function RootAuthHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        // 1. FAST CHECK: Try to read from LocalStorage first
        const checkCache = () => {
            const cachedRole = localStorage.getItem("userRole");
            const cachedApproved = localStorage.getItem("userApproved"); // Returns string "true" or "false"

            if (cachedRole === "Student") {
                navigate("/student-home");
                return true; // Found in cache
            } 
            
            if (cachedRole === "Tutor") {
                if (cachedApproved === "true") {
                    navigate("/tutor-home");
                } else {
                    // If stored as not approved, safer to send to login/check again
                    navigate("/login");
                }
                return true; // Found in cache
            }
            
            return false; // Not found, proceed to Firebase
        };

        const isCached = checkCache();

        // 2. SLOW CHECK: If not in cache, ask Firebase
        if (!isCached) {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        const userDocRef = doc(db, "users", user.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            
                            // Refresh cache for next time
                            localStorage.setItem("userRole", userData.role);
                            localStorage.setItem("userApproved", String(userData.isApproved));

                            if (userData.role === "Tutor") {
                                if (userData.isApproved === false) {
                                    await signOut(auth);
                                    navigate("/login");
                                } else {
                                    navigate("/tutor-home");
                                }
                            } else {
                                navigate("/student-home");
                            }
                        } else {
                            navigate("/login");
                        }
                    } catch (err) {
                        console.error(err);
                        navigate("/login");
                    }
                } else {
                    navigate("/login");
                }
            });

            return () => unsubscribe();
        }
    }, [navigate]);

    // RENDER SKELETON UI (Instant Visual Feedback)
    return (
        <div className="min-h-screen bg-slate-950 p-6 space-y-8 animate-pulse">
            {/* Fake Header */}
            <div className="h-8 w-48 bg-slate-800 rounded"></div>
            
            {/* Fake Hero Text */}
            <div className="space-y-3">
                <div className="h-12 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
            </div>

            {/* Fake Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl"></div>
                <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl"></div>
                <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl"></div>
            </div>
        </div>
    );
}

// ===== APP =====
function App() {
    const router = createBrowserRouter([
        // 1. The Root Redirector (Runs first at "quizmebro.tech/")
        {
            path: "/",
            element: <RootAuthHandler />,
        },

        // 2. Public Routes (NO Sidebar/Layout)
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/signup",
            element: <Signup />,
        },

        // 3. Protected Routes (Wrapped in Layout with Sidebar)
        {
            element: <Layout />, 
            children: [
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

                // ---------- FOOTER PAGES ----------
                {
                    path: "/blog",
                    element: <Suspense fallback={<PageLoader />}><Blog /></Suspense>,
                },
                {
                    path: "/contact-us",
                    element: <Suspense fallback={<PageLoader />}><ContactUs /></Suspense>,
                },
                {
                    path: "/refund-policy",
                    element: <Suspense fallback={<PageLoader />}><RefundPolicy /></Suspense>,
                },
                {
                    path: "/become-mentor",
                    element: <Suspense fallback={<PageLoader />}><BecomeMentor /></Suspense>,
                },
                {
                    path: "/privacy",
                    element: <Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>,
                },
                {
                    path: "/terms",
                    element: <Suspense fallback={<PageLoader />}><TermsOfUse /></Suspense>,
                },
                {
                    path: "/about-us",
                    element: <Suspense fallback={<PageLoader />}><AboutUs /></Suspense>,
                },
                {
                    path: "/campus-program",
                    element: <Suspense fallback={<PageLoader />}><CampusProgram /></Suspense>,
                },
                {
                    path: "/hire-from-us",
                    element: <Suspense fallback={<PageLoader />}><HireFromUs /></Suspense>,
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;