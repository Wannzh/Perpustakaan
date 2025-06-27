// components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

const HeaderSiswa: React.FC = () => {
  const navItems = [
    { name: 'Profile', href: 'profile' },
    { name: 'Books', href: 'books-list' },
    { name: 'Loans', href: '/loans' },
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white">LibraryHub</span>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:bg-indigo-700 hover:scale-105 transform transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeaderSiswa;