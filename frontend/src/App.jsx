import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login and SignUp/Login";
import Signup from "./components/Login and SignUp/Signup";
import StudentHomePage from "./components/StudentHomePage";
import TutorHomePage from "./components/TutorHomePage";
import AskQuestion from "./components/AskQuestion";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        // Landing / Default to Login for now, or you can make a LandingPage
        { path: "/", element: <Login /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },

        // Protected Routes (conceptually)
        { path: "/student-home", element: <StudentHomePage /> },
        {
          path: "/tutor-home",
          element: (
            <ProtectedRoute>
              <TutorHomePage />
            </ProtectedRoute>
          ),
        },
        { path: "/ask", element: <AskQuestion /> },
        { path: "/admin", element: <AdminDashboard /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
