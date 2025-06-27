import React from 'react';
import { UsersIcon, DocumentCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

const PerpustakawanDashboard: React.FC = () => {
  const features = [
    {
      name: 'Student Management',
      slug: 'Manage student accounts and borrowing privileges efficiently.',
      icon: UsersIcon,
    },
    {
      name: 'Loan Oversight',
      slug: 'Track and manage book loans and returns seamlessly.',
      icon: DocumentCheckIcon,
    },
    {
      name: 'Overdue Monitoring',
      slug: 'Monitor overdue books and send reminders to students.',
      icon: ClockIcon,
    },
  ];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="Library Interior"
            className="w-full h-32 sm:h-64 object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">Perpustakawan Dashboard - SMA Negeri 2 Plus Sipirok Library</h2>
              <p className="text-base sm:text-lg">Streamline library operations with ease.</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">About Perpustakawan Portal</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            The Perpustakawan Dashboard at SMA Negeri 2 Plus Sipirok Library equips librarians with intuitive tools to manage student accounts, oversee book loans, and monitor overdue returns. Stay organized and ensure a smooth library experience for all users.
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Librarian Tools</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center gap-x-3">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mb-2" aria-hidden="true"/>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.name}</h3>
                </div>
                <p className="mt-2 text-sm sm:text-base text-gray-600">{feature.slug}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a
            href="/perpustakawan/siswa-management"
            className="inline-block bg-indigo-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md text-base sm:text-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
            >
              Manage Students
            </a>
          </div>
      </div>
    </div>
  );
};

export default PerpustakawanDashboard;