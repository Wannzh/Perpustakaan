import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Book,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Cookies from "js-cookie";

const SidebarPerpustakawan: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/");
  };

  const navItems = [
    { to: "", label: "Dashboard", icon: LayoutDashboard },
    { to: "siswa-management", label: "Siswa Management", icon: Users },
    { to: "books-management", label: "Books Controller", icon: Book },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-md shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        {/* Title & Close (mobile) */}
        <div className="flex justify-between items-center mb-8 md:justify-center">
          <h2 className="text-2xl font-bold tracking-wide animate-fade-in-down">📚 Perpustakawan</h2>
          <button
            className="md:hidden text-gray-300 hover:text-white transition"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          {navItems.map(({ to, label, icon: Icon }, index) => (
            <NavLink
              key={index}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-5 py-3 rounded-lg font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-gray-700 text-white scale-[1.02] shadow-md"
                    : "hover:bg-gray-700 hover:text-white"
                } hover:scale-[1.02]`
              }
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md hover:scale-105"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </aside>
    </>
  );
};

export default SidebarPerpustakawan;
