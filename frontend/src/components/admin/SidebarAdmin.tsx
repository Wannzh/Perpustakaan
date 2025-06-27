import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserCircle, BookOpen, Users, Book, LogOut } from "lucide-react";
import Cookies from "js-cookie";

const SidebarAdmin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Kosongkan session/localStorage bila perlu
    Cookies.remove("authToken"); // contoh jika menggunakan token
    navigate("/"); // arahkan ke halaman login
  };

  return (
    <aside className="relative h-screen w-64 bg-gray-900 text-white flex flex-col p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-center">Admin Panel</h2>

      <nav className="flex flex-col gap-4 flex-grow">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-gray-800" : "hover:bg-gray-800"
            }`
          }
        >
          <UserCircle className="w-5 h-5" />
          Profile
        </NavLink>

        <NavLink
          to="pustakawan-management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-gray-800" : "hover:bg-gray-800"
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          Perpustakawan Controller
        </NavLink>

        <NavLink
          to="siswa-management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? "bg-gray-800" : "hover:bg-gray-800"
            }`
          }
        >
          <Users className="w-5 h-5" />
          Siswa Controller
        </NavLink>

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

      {/* Logout Button */}
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

export default SidebarAdmin;
