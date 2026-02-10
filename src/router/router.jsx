import { createBrowserRouter } from "react-router";
import Login from "../Pages/Authentication/Login";
import SignUp from "../Pages/Authentication/SignUp";
import DashboardLayout from "../Layouts/DashboardLayout";
import ManageCategory from "../Pages/Dashboard/ManageCategory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/signup",
    element: <SignUp />
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "manage-categories",
        element: <ManageCategory />
      }
    ]
  }
]);
