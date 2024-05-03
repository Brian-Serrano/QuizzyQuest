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
  const accessWrapper = async (url, header) => {
    const accessQuiz = async () => {
      try {
        const response = await fetch(url, { method: "GET", headers: header });
        return await response.json();
      } catch (error) {
        return {is_allowed: false, message: error.toString()};
      }
    };

    return await accessQuiz();
  };

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

    const response = await accessWrapper(
      `${BASE_URL}/access-routes/access-about-quiz?quiz_id=${params.id}&user_id=${user.id}`,
      getHeader()
    );

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
      element: <Signup />,
      loader: () => {
        const user = secureStorage.getItem('user');
        if (user && decodeToken(user.token) && !isExpired(user.token)) {
          return redirect("/");
        }
        return null;
      }
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
            if (params.unauth !== "unauthorized") {
              return redirect("/sign-up");
            }
            const prevQuiz = secureStorage.getItem('quiz');
            if (prevQuiz && prevQuiz.includes(Number(params.id))) {
              alert("Quiz is already answered");
              return redirect("/sign-up");
            } else {
              const response = await accessWrapper(
                `${BASE_URL}/quiz-unauth-routes/access-unauth-answer-quiz?quiz_id=${params.id}`,
                { "Content-Type": "application/json" }
              );

              if (response.is_allowed) {
                return [params.id, params.unauth];
              } else {
                alert(response.message);
                return redirect("/sign-up");
              }
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

            const response = await accessWrapper(
              `${BASE_URL}/access-routes/access-answer-quiz?quiz_id=${params.id}&user_id=${user.id}`,
              getHeader()
            );

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
      path: "/edit-quiz/:id",
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
