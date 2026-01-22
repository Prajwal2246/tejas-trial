import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login and SignUp/Login";
import Signup from "./components/Login and SignUp/Signup";
import StudentHomePage from "./components/StudentHomePage";
import TutorHomePage from "./components/TutorHomePage";
import AskQuestion from "./components/AskQuestion";
import "./App.css";
import AllQuestionsStudent from "./components/AllQuestionsStudent";
import AllQuestionsTutor from "./components/AllQuestionsTutor";
// import AllQuestionsTutor from "./components/AllQuestionsTutor";


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
        { path: "/tutor-home", element: <TutorHomePage /> },
        { path: "/ask", element: <AskQuestion /> },
         {path:"/all-question-student",element:<AllQuestionsStudent/>},
         {path:"/all-question-tutor",element:<AllQuestionsTutor/>}
        //  {path:"/questions1",element:<AllQuestionsTutor/>}
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
