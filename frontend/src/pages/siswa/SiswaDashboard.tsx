/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { BookOpenIcon, MagnifyingGlassIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { Star } from 'lucide-react';
import Cookies from 'js-cookie';

interface BookPopular {
  judulBuku: string;
  totalDipinjam: number;
}

interface BookBestSeller {
  judul: string;
  rataRataRating: number;
}

const SiswaDashboard: React.FC = () => {
  const [booksPopular, setBooksPopular] = useState<BookPopular[]>([]);
  const [booksBestSeller, setBooksBestSeller] = useState<BookBestSeller[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingBestSeller, setLoadingBestSeller] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    return {
      formattedStartDate: formatDate(startDate),
      formattedEndDate: formatDate(endDate),
    };
  };

  const fetchBooksPopular = async () => {
    setLoadingPopular(true);
    setError(null);
    try {
      const token = Cookies.get('authToken');
      if (!token) throw new Error('Token autentikasi tidak ditemukan');

      const { formattedStartDate, formattedEndDate } = getDateRange();

      const response = await fetch(
        `http://localhost:8080/api/laporan/buku-terpopuler?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Gagal mengambil data buku populer - Status ${response.status}`);
      }

      const data: BookPopular[] = await response.json();
      const sortedData = data
        .sort((a, b) => b.totalDipinjam - a.totalDipinjam)
        .slice(0, 2);
      setBooksPopular(sortedData);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data buku populer');
    } finally {
      setLoadingPopular(false);
    }
  };

  const fetchBooksBestSeller = async () => {
    setLoadingBestSeller(true);
    setError(null);
    try {
      const token = Cookies.get('authToken');
      if (!token) throw new Error('Token autentikasi tidak ditemukan');

      const response = await fetch(`http://localhost:8080/api/laporan/top-rated-books`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data buku terlaris - Status ${response.status}`);
      }

      const data: BookBestSeller[] = await response.json();
      const sortedData = data
        .sort((a, b) => b.rataRataRating - a.rataRataRating)
        .slice(0, 2);
      setBooksBestSeller(sortedData);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data buku terlaris');
    } finally {
      setLoadingBestSeller(false);
    }
  };

  useEffect(() => {
    fetchBooksPopular();
    fetchBooksBestSeller();
  }, []);

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

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${
              index < fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : hasHalfStar && index === fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 w-full font-sans antialiased">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 transform transition-all duration-500 hover:scale-[1.01]">
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Library Interior"
              className="w-full h-80 object-cover opacity-40 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6 animate-fade-in-down">
                <h1 className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-lg">
                  Welcome to SMA Negeri 2 Plus Sipirok Library
                </h1>
                <p className="text-xl font-medium drop-shadow-md">
                  Your gateway to knowledge and learning
                </p>
              </div>
            </div>
          </div>

          {/* Popular Books */}
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight animate-fade-in">Most Popular Books</h2>
            {loadingPopular ? (
              <p className="mt-6 text-gray-600 text-lg animate-pulse">Loading popular books...</p>
            ) : error ? (
              <p className="mt-6 text-red-600 text-lg animate-fade-in">{error}</p>
            ) : booksPopular.length === 0 ? (
              <p className="mt-6 text-gray-600 text-lg animate-fade-in">No popular books available.</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {booksPopular.map((book, index) => (
                  <div
                    key={`${book.judulBuku}-${book.totalDipinjam}-${index}`}
                    className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <BookOpenIcon className="h-10 w-10 text-indigo-600 mb-5" />
                    <h3 className="text-2xl font-semibold text-gray-900 line-clamp-1">{book.judulBuku}</h3>
                    <p className="mt-3 text-gray-600 text-base">Borrowed {book.totalDipinjam} times</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Best Seller Books */}
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight animate-fade-in">Top Rated Books</h2>
            {loadingBestSeller ? (
              <p className="mt-6 text-gray-600 text-lg animate-pulse">Loading top rated books...</p>
            ) : error ? (
              <p className="mt-6 text-red-600 text-lg animate-fade-in">{error}</p>
            ) : booksBestSeller.length === 0 ? (
              <p className="mt-6 text-gray-600 text-lg animate-fade-in">No top rated books available.</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {booksBestSeller.map((book, index) => (
                  <div
                    key={`${book.judul}-${book.rataRataRating}-${index}`}
                    className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <BookOpenIcon className="h-10 w-10 text-indigo-600 mb-5" />
                    <h3 className="text-2xl font-semibold text-gray-900 line-clamp-1">{book.judul}</h3>
                    <div className="mt-3">{renderStars(book.rataRataRating)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">About Our Library</h2>
            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              The library at SMA Negeri 2 Plus Sipirok is a hub of learning and discovery,
              dedicated to supporting students in their academic and personal growth.
              With a vast collection of books, digital resources, and a quiet study environment,
              we aim to foster a love for reading and research.
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight animate-fade-in">Library Services</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <feature.icon className="h-10 w-10 text-indigo-600 mb-5" />
                  <h3 className="text-2xl font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-3 text-gray-600 text-base">{feature.slug}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center animate-fade-in">
            <a
              href="/books"
              className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
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