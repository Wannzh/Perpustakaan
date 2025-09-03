/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import {
    BookOpenIcon,
    BuildingLibraryIcon,
    CalendarIcon,
    TagIcon,
    QueueListIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";

// Add coverImage to the Books interface
interface Books {
    id: number;
    judul: string;
    penerbit: string;
    tahunTerbit: number;
    kategori: string;
    jumlahEksemplar: number;
    stokTersedia: number;
    coverImage?: string; // Optional image URL for book cover
}

interface CartItem {
    id: number;
    judul: string;
    coverImage?: string;
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
    const [cart, setCart] = useState<CartItem[]>([]);

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
            const booksWithImages = data.map(book => ({
                ...book,
                coverImage: book.coverImage || "https://via.placeholder.com/150"
            }));
            setBooksList(booksWithImages);
            setFilteredBooks(booksWithImages);
        } catch (err: any) {
            console.error("Error:", err);
            setBorrowMessage(`Error: Gagal mengambil data buku - ${err.message}`);
            setShowPopup(true);
        }
    };

    const fetchCart = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            setBorrowMessage("Error: Token autentikasi tidak ditemukan");
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal mengambil data keranjang - Status ${response.status}`);
            }

            const data: CartItem[] = await response.json();
            setCart(data);
        } catch (err: any) {
            console.error("Error:", err);
            setBorrowMessage(`Error: Gagal mengambil data keranjang - ${err.message}`);
            setShowPopup(true);
        }
    };

    const handleAddToCart = async (book: Books) => {
        if (cart.some(item => item.id === book.id)) {
            setBorrowMessage("Error: Buku sudah ada di keranjang");
            setShowPopup(true);
            return;
        }

        const token = Cookies.get("authToken");
        if (!token) {
            setBorrowMessage("Error: Token autentikasi tidak ditemukan");
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookId: book.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal menambahkan buku ke keranjang - Status ${response.status}`);
            }

            setCart([...cart, { id: book.id, judul: book.judul, coverImage: book.coverImage }]);
            setBorrowMessage("Buku berhasil ditambahkan ke keranjang!");
            setShowPopup(true);
        } catch (err: any) {
            console.error("Error:", err);
            setBorrowMessage(`Error: ${err.message}`);
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
        fetchCart();
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 animate-fade-in-down">
                    Koleksi Buku
                </h1>
                <Link
                    to="/siswa/cart"
                    className="relative flex items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    <ShoppingCartIcon className="h-6 w-6 mr-2" />
                    Keranjang
                    {cart.length > 0 && (
                        <span className="absolute top-0 right-0  bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </Link>
            </div>


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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book, index) => (
                        <div
                            key={book.id}
                            className="bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative">
                                <img
                                    src={book.coverImage || "https://via.placeholder.com/150"}
                                    alt={book.judul}
                                    className="w-full h-48 object-cover rounded-t-xl"
                                />
                                {book.jumlahEksemplar === 0 && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                        Stok Habis
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                    {book.judul}
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <BuildingLibraryIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span>{book.penerbit}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span>{book.tahunTerbit}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <TagIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span>{book.kategori}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span>{book.jumlahEksemplar} eksemplar</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span>{book.stokTersedia} stok tersedia</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-4 rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                                        onClick={() => openModal(book)}
                                    >
                                        Lihat Detail
                                    </button>
                                    {cart.some(item => item.id === book.id) ? (
                                        <button
                                            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 px-4 rounded-full opacity-50 cursor-not-allowed transition-all duration-300 shadow-md"
                                            disabled
                                        >
                                            Sudah di Keranjang
                                        </button>
                                    ) : (
                                        <button
                                            className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${book.jumlahEksemplar === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => handleAddToCart(book)}
                                            disabled={book.jumlahEksemplar === 0}
                                        >
                                            Tambah ke Keranjang
                                        </button>
                                    )}
                                </div>
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
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-gray-800 line-clamp-2">
                                {selectedBook.judul}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closeModal}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <img
                                src={selectedBook.coverImage || "https://via.placeholder.com/150"}
                                alt={selectedBook.judul}
                                className="w-full sm:w-1/3 h-48 object-cover rounded-lg"
                            />
                            <div className="flex-1 space-y-4 text-sm text-gray-600">
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
                        </div>
                        <div className="mt-6 flex gap-2">
                            <button
                                className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-6 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${isBorrowing || selectedBook.jumlahEksemplar === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleBorrowBook}
                                disabled={isBorrowing || selectedBook.jumlahEksemplar === 0}
                            >
                                {isBorrowing ? 'Memproses...' : selectedBook.jumlahEksemplar === 0 ? 'Stok Habis' : 'Pinjam Buku'}
                            </button>
                            {cart.some(item => item.id === selectedBook.id) ? (
                                <button
                                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 px-6 rounded-full opacity-50 cursor-not-allowed transition-all duration-300 shadow-md"
                                    disabled
                                >
                                    Sudah di Keranjang
                                </button>
                            ) : (
                                <button
                                    className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${selectedBook.jumlahEksemplar === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => handleAddToCart(selectedBook)}
                                    disabled={selectedBook.jumlahEksemplar === 0}
                                >
                                    Tambah ke Keranjang
                                </button>
                            )}
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
                            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-6 rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
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