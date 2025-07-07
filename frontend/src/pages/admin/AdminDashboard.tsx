import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { UsersIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { Library } from 'lucide-react';

interface Siswa {
  id: number;
  name: string;
  username: string;
  email: string;
  nis: string;
  userClass: string;
  role: string;
}

interface Pustakawan {
  id: number;
  name: string;
  username: string;
  email: string;
  nip: string;
}

interface Books {
  id: number;
  judul: string;
  penerbit: string;
  tahunTerbit: number;
  kategori: string;
  jumlahEksemplar: number;
}

const AdminDashboard: React.FC = () => {
  const [siswaData, setSiswaData] = useState<Siswa[]>([]);
  const [pustakawanData, setPustakawanData] = useState<Pustakawan[]>([]);
  const [bookList, setBookList] = useState<Books[]>([]);

  useEffect(() => {
    fetchDataPustakawan();
    fetchDataSiswa();
    fetchBookList();
  }, []);

  const fetchDataPustakawan = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      console.log("Token tidak ditemukan di cookie");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/admin/pustakawan/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data pustakawan - Status ${response.status}`);
      }

      const data: Pustakawan[] = await response.json();
      setPustakawanData(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchDataSiswa = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      console.error("Token tidak ditemukan di cookie");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/siswa/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data siswa - Status ${response.status}`);
      }

      const data: Siswa[] = await response.json();
      setSiswaData(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchBookList = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      console.error("Token tidak ditemukan di cookie");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/books", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data buku - Status ${response.status}`);
      }

      const data: Books[] = await response.json();
      setBookList(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const features = [
    {
      name: 'Total Students',
      slug: `${siswaData.length} Students`,
      description: 'Manage student accounts and access details.',
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Total Librarians',
      slug: `${pustakawanData.length} Librarians`,
      description: 'Oversee librarian accounts and permissions.',
      icon: Library,
      color: 'bg-gray-100 text-gray-600',
    },
    {
      name: 'Total Books',
      slug: `${bookList.length} Books`,
      description: 'Track and update the library catalog.',
      icon: BookOpenIcon,
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full font-sans">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="relative bg-indigo-600 rounded-2xl shadow-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Library Interior"
              className="w-full h-80 object-cover opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-5xl font-extrabold mb-3 tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xl font-medium">SMA Negeri 2 Plus Sipirok Library</p>
                <p className="text-lg mt-2 opacity-90">Streamline library operations with ease.</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Library Overview</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className={`relative bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${feature.color}`}
                >
                  <div className="flex items-center space-x-4">
                    <feature.icon className="h-12 w-12" />
                    <div>
                      <h3 className="text-xl font-semibold">{feature.name}</h3>
                      <p className="mt-1 text-3xl font-bold">{feature.slug}</p>
                      <p className="mt-2 text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">About Admin Portal</h2>
            <p className="mt-4 text-gray-600 leading-7">
              The Admin Dashboard for SMA Negeri 2 Plus Sipirok Library simplifies library management. Monitor user accounts, update the book catalog, and access analytics to ensure an organized and efficient library system.
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <a
              href="/admin/manage"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Start Managing Now
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;