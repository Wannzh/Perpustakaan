import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Book, LogOut, Users, LayoutDashboard } from "lucide-react";
import Cookies from "js-cookie";

const SidebarPerpustakawan: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("authToken"); // contoh jika menggunakan cookies
    navigate("/"); // arahkan ke halaman login
  };

  return (
    <aside className="relative h-screen w-64 bg-gray-900 text-white flex flex-col p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-center">Perpustakawan Panel</h2>

      <nav className="flex flex-col gap-4 flex-grow">
        {/* Dashboard */}
        <NavLink
          to=""
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-gray-800" : "hover:bg-gray-800"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>

        {/* Siswa Management */}
        <NavLink
          to="siswa-management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-gray-800" : "hover:bg-gray-800"
            }`
          }
        >
          <Users className="w-5 h-5" />
          Siswa Management
        </NavLink>

        {/* Books Controller */}
        <NavLink
          to="books-management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-gray-800" : "hover:bg-gray-800"
            }`
          }
        >
          <Book className="w-5 h-5" />
          Books Controller
        </NavLink>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-3 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
};

export default SidebarPerpustakawan;
