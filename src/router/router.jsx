import { createBrowserRouter } from "react-router";
import Login from "../Pages/Authentication/Login";
import SignUp from "../Pages/Authentication/SignUp";
import DashboardLayout from "../Layouts/DashboardLayout";
import ManageCategory from "../Pages/Dashboard/ManageCategory";
import ManageRecipes from "../Pages/Dashboard/Admin/ManageRecipes";
import AllRecipes from "../Pages/Dashboard/User/AllRecipes";
import ManageReviews from "../Pages/Dashboard/Admin/ManageReviews";

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
      },
      {
        path: "manage-recipe",
        element: <ManageRecipes />
      },
      {
        path: "all-recipes",
        element: <AllRecipes />
      },
      {
        path: "manage-reviews",
        element: <ManageReviews />
      }
    ]
  }
]);
