import React from 'react';
import { Link } from 'react-router-dom';

const FooterSiswa: React.FC = () => {
  return (
    <footer className="bg-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-white text-sm mb-4 sm:mb-0">
            © {new Date().getFullYear()} LibraryHub. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link
              to="/about"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSiswa;