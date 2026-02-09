import { createBrowserRouter } from "react-router";
import Login from "../Pages/Authentication/Login";
import SignUp from "../Pages/Authentication/SignUp";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login></Login>
  },
  {
    path: '/signup',
    element: <SignUp></SignUp>
  }
]);