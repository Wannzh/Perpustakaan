/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
    BookOpenIcon,
    BuildingLibraryIcon,
    CalendarIcon,
    TagIcon,
    QueueListIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

interface Books {
    id: number;
    judul: string;
    penerbit: string;
    tahunTerbit: number;
    kategori: string;
    jumlahEksemplar: number;
    stokTersedia: number;
}

const BooksList: React.FC = () => {
    const [booksList, setBooksList] = useState<Books[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Books[]>([]);
    const [selectedBook, setSelectedBook] = useState<Books | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("judul-asc");
    const [isBorrowing, setIsBorrowing] = useState<boolean>(false);
    const [borrowMessage, setBorrowMessage] = useState<string>("");
    const [showPopup, setShowPopup] = useState<boolean>(false);

    const fetchBooks = async () => {
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            setBorrowMessage("Error: Token autentikasi tidak ditemukan");
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/books/get-all", {
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
            setBooksList(data);
            setFilteredBooks(data);
        } catch (err: any) {
            console.error("Error:", err);
            setBorrowMessage(`Error: Gagal mengambil data buku - ${err.message}`);
            setShowPopup(true);
        }
    };

    const handleBorrowBook = async () => {
        if (!selectedBook) return;

        setIsBorrowing(true);
        setBorrowMessage("");

        const token = Cookies.get("authToken");
        if (!token) {
            setBorrowMessage("Error: Token autentikasi tidak ditemukan");
            setIsBorrowing(false);
            setShowPopup(true);
            return;
        }

        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 7);

        try {
            const response = await fetch("http://localhost:8080/api/peminjaman/self/tambah", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bukuId: selectedBook.id,
                    tanggalPinjam: today.toISOString().split('T')[0],
                    tanggalJatuhTempo: dueDate.toISOString().split('T')[0],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal meminjam buku - Status ${response.status}`);
            }

            const result = await response.json();
            setBorrowMessage(`Buku berhasil dipinjam! Jatuh tempo: ${new Date(result.tanggalJatuhTempo).toLocaleDateString()}`);
            setBooksList(prevBooks =>
                prevBooks.map(book =>
                    book.id === selectedBook.id
                        ? { ...book, jumlahEksemplar: book.jumlahEksemplar - 1 }
                        : book
                )
            );
            setShowPopup(true);
        } catch (err: any) {
            setBorrowMessage(`Error: ${err.message}`);
            setShowPopup(true);
        } finally {
            setIsBorrowing(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        let result = [...booksList];

        if (searchTerm) {
            result = result.filter(
                (book) =>
                    book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.kategori.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortOption) {
            case "judul-asc":
                result.sort((a, b) => a.judul.localeCompare(b.judul));
                break;
            case "judul-desc":
                result.sort((a, b) => b.judul.localeCompare(a.judul));
                break;
            case "tahun-asc":
                result.sort((a, b) => a.tahunTerbit - b.tahunTerbit);
                break;
            case "tahun-desc":
                result.sort((a, b) => b.tahunTerbit - a.tahunTerbit);
                break;
            case "jumlah-asc":
                result.sort((a, b) => a.jumlahEksemplar - b.jumlahEksemplar);
                break;
            case "jumlah-desc":
                result.sort((a, b) => b.jumlahEksemplar - a.jumlahEksemplar);
                break;
            default:
                break;
        }

        setFilteredBooks(result);
    }, [searchTerm, sortOption, booksList]);

    const openModal = (book: Books) => {
        setSelectedBook(book);
        setBorrowMessage("");
    };

    const closeModal = () => {
        setSelectedBook(null);
        setBorrowMessage("");
        setShowPopup(false);
    };

    const closePopup = () => {
        setShowPopup(false);
        setBorrowMessage("");
        if (!borrowMessage.includes("Error")) {
            setSelectedBook(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans antialiased">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center animate-fade-in-down">
                Koleksi Buku
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan judul atau kategori..."
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <QueueListIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 transform -translate-y-1/2" />
                    <select
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-white border-gray-200 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="judul-asc">Judul (A-Z)</option>
                        <option value="judul-desc">Judul (Z-A)</option>
                        <option value="tahun-desc">Tanggal Terbit (Terbaru)</option>
                        <option value="tahun-asc">Tanggal Terbit (Terlama)</option>
                        <option value="jumlah-desc">Jumlah Eksemplar (Tinggi ke Rendah)</option>
                        <option value="jumlah-asc">Jumlah Eksemplar (Rendah ke Tinggi)</option>
                    </select>
                </div>
            </div>

            {filteredBooks.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium animate-fade-in">
                    Tidak ada buku yang ditemukan
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBooks.map((book, index) => (
                        <div
                            key={book.id}
                            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                                        {book.judul}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <BuildingLibraryIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Penerbit:</span>
                                            <span className="ml-1">{book.penerbit}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Tahun Terbit:</span>
                                            <span className="ml-1">{book.tahunTerbit}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <TagIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Kategori:</span>
                                            <span className="ml-1">{book.kategori}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Jumlah Eksemplar:</span>
                                            <span className="ml-1">{book.jumlahEksemplar}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Stok buku:</span>
                                            <span className="ml-1">{book.stokTersedia}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="mt-4 sm:mt-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 sm:ml-6 shadow-sm"
                                    onClick={() => openModal(book)}
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedBook && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-gray-800">{selectedBook.judul}</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closeModal}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <BuildingLibraryIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Penerbit:</span>
                                <span className="ml-1">{selectedBook.penerbit}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Tahun Terbit:</span>
                                <span className="ml-1">{selectedBook.tahunTerbit}</span>
                            </div>
                            <div className="flex items-center">
                                <TagIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Kategori:</span>
                                <span className="ml-1">{selectedBook.kategori}</span>
                            </div>
                            <div className="flex items-center">
                                <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Jumlah Eksemplar:</span>
                                <span className="ml-1">{selectedBook.jumlahEksemplar}</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                className={`w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-sm ${
                                    isBorrowing || selectedBook.jumlahEksemplar === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={handleBorrowBook}
                                disabled={isBorrowing || selectedBook.jumlahEksemplar === 0}
                            >
                                {isBorrowing ? 'Memproses...' : selectedBook.jumlahEksemplar === 0 ? 'Stok Habis' : 'Pinjam Buku'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPopup && borrowMessage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={closePopup}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {borrowMessage.includes('Error') ? 'Peminjaman Gagal' : 'Peminjaman Berhasil'}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closePopup}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <p className={`text-sm ${borrowMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                            {borrowMessage}
                        </p>
                        <button
                            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-sm"
                            onClick={closePopup}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksList;