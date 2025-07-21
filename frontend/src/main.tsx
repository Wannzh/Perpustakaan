import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";
import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import PerpustakawanLayout from "./layout/PerpustakawanLayout";
import SiswaLayout from "./layout/SiswaLayout";
import SiswaDashboard from "./pages/siswa/SiswaDashboard";
import PerpustakawanDashboard from "./pages/perpustakawan/PerpustakawanDashboard";
import SiswaControllerPustkawan from "./pages/perpustakawan/SiswaControllerPustkawan";
import PustakawanController from "./pages/admin/PustakawanController";
import BooksControllerAdmin from "./pages/admin/BooksControllerAdmin";
import BooksControllerPustakawan from "./pages/perpustakawan/BooksControllerPustakawan";
import BooksList from "./pages/siswa/BooksList";
import ProfileSiswa from "./pages/siswa/ProfileSiswa";
import SiswaControllerAdmin from "./pages/admin/SiswaControllerAdmin";
import LoansBooksSiswa from "./pages/siswa/LoansBooksSiswa";
import LoansBooksPustakawan from "./pages/perpustakawan/LoansBooksPustakawan";
import BooksPengembalian from "./pages/perpustakawan/BooksPengembalian";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },

  // ADMIN
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["ADMIN", "KEPALA"]} />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <AdminDashboard />
          },
          {
            path: "pustakawan-management",
            element: <PustakawanController />
          },
          {
            path: "siswa-management",
            element: <SiswaControllerAdmin />
          },
          {
            path: "books-management",
            element: <BooksControllerAdmin />
          },
        ],
      },
    ],
  },

  // PERPUSTAKAWAN
  {
    path: "/perpus",
    element: <ProtectedRoute allowedRoles={["PERPUSTAKAWAN", "PUSTAKAWAN", "perpus"]} />,
    children: [
      {
        path: "",
        element: <PerpustakawanLayout />,
        children: [
          {
            index: true,
            element: <PerpustakawanDashboard />
          },
          {
            path: "siswa-management",
            element: <SiswaControllerPustkawan />
          },
          {
            path: "books-management",
            element: <BooksControllerPustakawan />
          },
          {
            path: "loans-management",
            element: <LoansBooksPustakawan />
          },
          {
            path: "pengembalian-management",
            element: <BooksPengembalian />
          },
        ],
      },
    ],
  },

  // SISWA
  {
    path: "/siswa",
    element: <ProtectedRoute allowedRoles={["SISWA"]} />,
    children: [
      {
        path: "",
        element: <SiswaLayout />,
        children: [
          { 
            path: "",
            element: <SiswaDashboard /> 
          },
          { 
            path: "books-list",
            element: <BooksList /> 
          },
          { 
            path: "profile",
            element: <ProfileSiswa /> 
          },
          { 
            path: "loans",
            element: <LoansBooksSiswa /> 
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
