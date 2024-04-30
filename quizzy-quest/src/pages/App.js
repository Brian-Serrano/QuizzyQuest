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
import { BASE_URL } from "../utils/constants";
import { getHeader } from "../utils/func-utils";
import EditQuiz from "./EditQuiz";
import { secureStorage } from "../utils/secureStorage";

export default function App() {
  const checkAuthentication = () => {
    const user = secureStorage.getItem('user');
    if (!user || !decodeToken(user.token) || isExpired(user.token)) {
      return redirect("/sign-up");
    }
    return null;
  };

  const protectAboutQuiz = async ({ params }) => {
    const user = secureStorage.getItem('user');
    if (!user || !decodeToken(user.token) || isExpired(user.token)) {
      return redirect("/sign-up");
    }

    const accessAboutQuiz = async () => {
      try {
        const response = await fetch(`${BASE_URL}/access-routes/access-about-quiz?quiz_id=${params.id}&user_id=${user.id}`, {
          method: "GET",
          headers: getHeader()
        });
        return await response.json();
      } catch (error) {
        return {is_allowed: false, message: error.toString()};
      }
    };

    const response = await accessAboutQuiz();

    if (response.is_allowed) {
      return params.id;
    } else {
      alert(response.message);
      return redirect("/");
    }
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
      children: [
        {
          path: ":unauth",
          element: <AnswerQuiz />,
          loader: async ({ params }) => {
            if (params.unauth === "unauthorized") {
              return [params.id, params.unauth];
            }
          }
        },
        {
          path: "",
          element: <AnswerQuiz />,
          loader: async ({ params }) => {
            const user = secureStorage.getItem('user');
            if (!user || !decodeToken(user.token) || isExpired(user.token)) {
              return redirect("/sign-up");
            }

            const accessAnswerQuiz = async () => {
              try {
                const response = await fetch(`${BASE_URL}/access-routes/access-answer-quiz?quiz_id=${params.id}&user_id=${user.id}`, {
                  method: "GET",
                  headers: getHeader()
                });
                return await response.json();
              } catch (error) {
                return {is_allowed: false, message: error.toString()};
              }
            };

            const response = await accessAnswerQuiz();

            if (response.is_allowed) {
              return [params.id, ""];
            } else {
              alert(response.message);
              return redirect("/");
            }
          }
        }
      ]
    },
    {
      path: "/about-quiz/:id",
      element: <AboutQuiz />,
      loader: protectAboutQuiz
    },
    {
      path: "edit-quiz/:id",
      element: <EditQuiz />,
      loader: protectAboutQuiz
    },
    {
      path: "/profile/:id",
      element: <Profile />,
      loader: ({ params }) => {
        const user = secureStorage.getItem('user');
        if (!user || !decodeToken(user.token) || isExpired(user.token)) {
          return redirect("/sign-up");
        }
        return params.id;
      }
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
