import React, { lazy, Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// ===== EAGER IMPORTS (Critical) =====
import Layout from "./components/Layout";
import Login from "./components/Login and SignUp/Login";
import Signup from "./components/Login and SignUp/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

// ===== LAZY LOADED IMPORTS =====
const StudentHomePage = lazy(() => import("./components/StudentHomePage"));
const TutorHomePage = lazy(() => import("./components/TutorHomePage"));
const TutorSessionHistory = lazy(() => import("./components/TutorSessionHistory"));
const StudentSessionHistory = lazy(() => import("./components/StudentSessionHistory"));
const AskQuestion = lazy(() => import("./components/AskQuestion"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AllQuestionsStudent = lazy(() => import("./components/AllQuestionsStudent"));
const AllQuestionsTutor = lazy(() => import("./components/AllQuestionsTutor"));
const TutorQuestionDetail = lazy(() => import("./components/TutorQuestionDetail"));
const StudentQuestionDetail = lazy(() => import("./components/StudentQuestionDetail"));
const AcceptQuestionPage = lazy(() => import("./components/AcceptQuestionPage"));
const VideoSession = lazy(() => import("./components/VideoSession"));

// Footer Pages (lowest priority - lazy load)
const PrivacyPolicy = lazy(() => import("./components/FooterComponents/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./components/FooterComponents/RefundPolicy"));
const AboutUs = lazy(() => import("./components/FooterComponents/AboutUs"));
const Blog = lazy(() => import("./components/FooterComponents/Blog"));
const TermsOfUse = lazy(() => import("./components/FooterComponents/TermsOfUse"));
const CampusProgram = lazy(() => import("./components/FooterComponents/CampusProgram"));
const ContactUs = lazy(() => import("./components/FooterComponents/ContactUs"));
const BecomeMentor = lazy(() => import("./components/FooterComponents/BecomeMentor"));
const HireFromUs = lazy(() => import("./components/FooterComponents/HireFromUs"));

// ===== LIGHTWEIGHT FALLBACK LOADER =====
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent 
                        rounded-full animate-spin" />
    </div>
);

// ===== OPTIMIZED ROOT AUTH HANDLER =====
function RootAuthHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        // 🚀 INSTANT CHECK: Read from localStorage (cached data)
        const cachedRole = localStorage.getItem("userRole");
        const cachedApproved = localStorage.getItem("userApproved");

        // If we have cached data, navigate immediately
        if (cachedRole) {
            if (cachedRole === "Student") {
                navigate("/student-home", { replace: true });
                return;
            } else if (cachedRole === "Tutor" && cachedApproved === "true") {
                navigate("/tutor-home", { replace: true });
                return;
            }
        }

        // 🔍 FALLBACK: Check Firebase auth state (only if no cache)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/login", { replace: true });
            } else {
                // User is logged in but no cache - redirect to login to refresh cache
                navigate("/login", { replace: true });
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // MINIMAL skeleton UI
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent 
                            rounded-full animate-spin" />
        </div>
    );
}

// ===== APP =====
function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <RootAuthHandler />,
        },

        // Public Routes
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/signup",
            element: <Signup />,
        },

        // Protected Routes
        {
            element: <Layout />, 
            children: [
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