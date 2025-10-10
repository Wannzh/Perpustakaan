/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { UsersIcon, BookOpenIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface Siswa {
  id: string;
  name: string;
  username: string;
  email: string;
  nis: string;
  userClass: string;
  role: string;
  active: boolean;
}

const PerpustakawanDashboard: React.FC = () => {
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [totSiswaPeminjam, setTotSiswaPeminjam] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const token = Cookies.get('authToken');

  useEffect(() => {
    fetchSiswa();
    fetchDataPeminjaman();
  }, []);

  const fetchSiswa = async () => {
    try {
      if (!token) {
        setErrorMessage('Error: Token autentikasi tidak ditemukan');
        return;
      }
      const response = await fetch('http://localhost:8080/api/siswa/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Gagal mengambil data siswa - Status ${response.status}`);
      }
      const data = await response.json();
      setSiswa(data);
    } catch (error: any) {
      console.error('Error fetching siswa:', error);
      setErrorMessage(`Error: Gagal mengambil data siswa - ${error.message}`);
    }
  };

  const fetchDataPeminjaman = async () => {
    try {
      if (!token) {
        setErrorMessage('Error: Token autentikasi tidak ditemukan');
        return;
      }
      const response = await fetch('http://localhost:8080/api/peminjaman/manual/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Gagal mengambil data peminjaman - Status ${response.status}`);
      }
      const data = await response.json();
      setTotSiswaPeminjam(data.totalSiswaAktifMeminjam || 0);
      setBorrowedBooks(data.totalBukuDipinjam || 0);
    } catch (error: any) {
      console.error('Error fetching peminjaman:', error);
      setErrorMessage(`Error: Gagal mengambil data peminjaman - ${error.message}`);
    }
  };

  const siswaAktif = siswa.filter((s) => s.active === true);

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
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">Pustakawan Dashboard - SMA Negeri 2 Plus Sipirok Library</h2>
              <p className="text-base sm:text-lg">Streamline library operations with ease.</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">About Pustakawan Portal</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            The Perpustakawan Dashboard at SMA Negeri 2 Plus Sipirok Library equips librarians with intuitive tools to manage student accounts, oversee book loans, and monitor overdue returns. Stay organized and ensure a smooth library experience for all users.
          </p>
        </div>

        {/* Library Statistics Section */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Statistik Perpustakaan</h2>
          {errorMessage ? (
            <div className="mt-6 text-center text-red-500 text-lg font-medium animate-fade-in">
              {errorMessage}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
                <div className="flex items-center gap-x-3">
                  <UsersIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900">Siswa Aktif</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-800">{siswaAktif.length}</p>
                <p className="mt-1 text-sm text-gray-600">Total siswa aktif terdaftar</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-x-3">
                  <BookOpenIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900">Buku Dipinjam</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-800">{borrowedBooks}</p>
                <p className="mt-1 text-sm text-gray-600">Total buku yang sedang dipinjam</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-x-3">
                  <DocumentCheckIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900">Siswa Peminjam Aktif</h3>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-800">{totSiswaPeminjam}</p>
                <p className="mt-1 text-sm text-gray-600">Total siswa yang sedang meminjam buku</p>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a
            href="/perpustakawan/siswa-management"
            className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-sm"
          >
            Kelola Siswa
          </a>
        </div>
      </div>
    </div>
  );
};

export default PerpustakawanDashboard;