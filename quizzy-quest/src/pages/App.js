import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import AddQuiz from "./AddQuiz";
import AnswerQuiz from "./AnswerQuiz";
import AboutQuiz from "./AboutQuiz";
import Profile from "./Profile";
import Settings from "./Settings";
import PageNotFound from "./PageNotFound";
import { isExpired, decodeToken } from "react-jwt";

export default function App() {
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (!decodeToken(token) || isExpired(token)) {
      return redirect("/sign-up");
    }
    return null;
  };

  const getIdAndcheckAuthentication = ({ params }) => {
    const token = localStorage.getItem('token');
    if (!decodeToken(token) || isExpired(token)) {
      return redirect("/sign-up");
    }
    return params.id;
  };

  const router = createBrowserRouter([
    {
      path: "/sign-up",
      element: <Signup />
    },
    {
      path: "/",
      element: <Dashboard />,
      loader: checkAuthentication
    },
    {
      path: "/add-quiz",
      element: <AddQuiz />,
      loader: checkAuthentication
    },
    {
      path: "/answer-quiz/:id",
      element: <AnswerQuiz />,
      loader: getIdAndcheckAuthentication
    },
    {
      path: "/about-quiz/:type/:id",
      element: <AboutQuiz />,
      loader: ({ params }) => {
        const token = localStorage.getItem('token');
        if (!decodeToken(token) || isExpired(token)) {
          return redirect("/sign-up");
        }
        return [params.id, params.type];
      }
    },
    {
      path: "/profile/:id",
      element: <Profile />,
      loader: getIdAndcheckAuthentication
    },
    {
      path: "/settings",
      element: <Settings />,
      loader: checkAuthentication
    },
    {
      path: "*",
      element: <PageNotFound />
    }
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
