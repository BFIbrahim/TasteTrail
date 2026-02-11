import { createBrowserRouter } from "react-router";
import Login from "../Pages/Authentication/Login";
import SignUp from "../Pages/Authentication/SignUp";
import DashboardLayout from "../Layouts/DashboardLayout";
import ManageCategory from "../Pages/Dashboard/ManageCategory";
import ManageRecipes from "../Pages/Dashboard/Admin/ManageRecipes";
import AllRecipes from "../Pages/Dashboard/User/AllRecipes";
import ManageReviews from "../Pages/Dashboard/Admin/ManageReviews";
import MealPlanner from "../Pages/Dashboard/User/MealPlanner";
import UserManagement from "../Pages/Dashboard/Admin/UserManagement";
import PrivetRoute from "../routes/PrivetRoute";
import PersonalCookbook from "../Pages/Dashboard/User/PersonalCookbook";
import DashboardIndex from "../Components/DashboardIndex";
import AdminRoute from "../routes/AdminRoutes";
import Forbidden from "../Components/Forbidden";

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
    path: '/forbidden',
    element: <Forbidden />
  },
  {
    path: "/dashboard",
    element: <PrivetRoute><DashboardLayout /></PrivetRoute>,
    children: [
      {
        index: true,
        element: <DashboardIndex />
      },
      {
        path: "manage-categories",
        element: <AdminRoute><ManageCategory /></AdminRoute>
      },
      {
        path: "manage-recipe",
        element: <AdminRoute><ManageRecipes /></AdminRoute>
      },
      {
        path: "all-recipes",
        element: <AllRecipes />
      },
      {
        path: "manage-reviews",
        element: <AdminRoute><ManageReviews /></AdminRoute>
      },
      {
        path: "meal-planner",
        element: <MealPlanner />
      },
      {
        path: 'manage-users',
        element: <AdminRoute><UserManagement /></AdminRoute>
      },
      {
        path: 'personal-cookbook',
        element: <PersonalCookbook />
      }
    ]
  }
]);
