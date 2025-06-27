import React from 'react';
import { BookOpenIcon, MagnifyingGlassIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const SiswaDashboard: React.FC = () => {
  const features = [
    {
      name: 'Borrow Books',
      slug: 'Easily browse and borrow from our extensive collection of academic and fiction books.',
      icon: BookOpenIcon,
    },
    {
      name: 'Search Catalog',
      slug: 'Find books quickly using our online catalog search tool.',
      icon: MagnifyingGlassIcon,
    },
    {
      name: 'Digital Resources',
      slug: 'Access e-books, journals, and study materials online.',
      icon: ComputerDesktopIcon,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 w-full">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Library Interior"
              className="w-full h-64 object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">Welcome to SMA Negeri 2 Plus Sipirok Library</h1>
                <p className="text-lg">Your gateway to knowledge and learning.</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900">About Our Library</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              The library at SMA Negeri 2 Plus Sipirok is a hub of learning and discovery, dedicated to supporting students in their academic and personal growth. With a vast collection of books, digital resources, and a quiet study environment, we aim to foster a love for reading and research.
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900">Library Services</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <feature.icon className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-gray-600">{feature.slug}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <a
              href="/books"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
            >
              Explore Our Collection
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SiswaDashboard;