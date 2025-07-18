import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Library, User, Book, FileText } from 'lucide-react';

const HeaderSiswa: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Profile', href: 'profile', icon: User },
    { name: 'Books', href: 'books-list', icon: Book },
    { name: 'Loans', href: 'loans', icon: FileText },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg'
          : 'bg-gradient-to-r from-indigo-600 to-blue-500 shadow-md'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <Library 
            className={`w-8 h-8 ${isScrolled ? 'text-indigo-600' : 'text-white'}`} />
            <span className={`text-2xl font-extrabold ml-2 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              LibraryHub
            </span>
          </motion.div>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                  isScrolled
                    ? 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-800'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default HeaderSiswa;