import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Users, Book, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

const SidebarAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/");
  };

  const navItems = [
    { to: "pustakawan-management", label: "Perpustakawan", icon: BookOpen },
    { to: "siswa-management", label: "Siswa", icon: Users },
    { to: "books-management", label: "Buku", icon: Book },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen || window.innerWidth >= 768 ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col p-6 shadow-2xl md:relative z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between md:justify-center mb-10">
          <h2
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-wide cursor-pointer bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text animate-fade-in-down"
          >
            Admin Panel
          </h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 flex-grow">
          {navItems.map(({ to, label, icon: Icon }, i) => (
            <NavLink
              key={i}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow hover:scale-[1.05] ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-gray-800 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white"
                }`
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
          className="mt-8 flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 text-white" />
          Logout
        </button>
      </motion.aside>
    </>
  );
};

export default SidebarAdmin;
