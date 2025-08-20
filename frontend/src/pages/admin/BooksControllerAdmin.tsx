import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Book, Plus, Search, X, Save, Trash2, Edit, XCircle, CheckCircle, AlertCircle, Info, Building, Calendar, Tags, Layers, BookOpen } from "lucide-react";

interface Books {
    id: number;
    judul: string;
    penerbit: string;
    tahunTerbit: number;
    kategori: string;
    jumlahEksemplar: number;
}

interface BooksRequestDTO {
    judul: string;
    penerbit: string;
    tahunTerbit: number;
    kategori: string;
    jumlahEksemplar: number;
}

const BooksControllerAdmin: React.FC = () => {
    const [bookList, setBookList] = useState<Books[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Books[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [deleteBookId, setDeleteBookId] = useState<number | null>(null);
    const [openInfoModal, setOpenInfoModal] = useState<Books | null>(null);
    const [newBook, setNewBook] = useState<BooksRequestDTO>({
        judul: "",
        penerbit: "",
        tahunTerbit: new Date().getFullYear(),
        kategori: "",
        jumlahEksemplar: 1,
    });
    const [editBook, setEditBook] = useState<Books>({
        id: 0,
        judul: "",
        penerbit: "",
        tahunTerbit: new Date().getFullYear(),
        kategori: "",
        jumlahEksemplar: 1,
    });
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchType, setSearchType] = useState<"judul" | "kategori">("judul");

    const categories = [
        "Fiksi",
        "Non-Fiksi",
        "Literatur Anak & Remaja",
        "Praktis & Hobi",
        "Referensi"
    ];

    useEffect(() => {
        fetchBookList();
    }, []);

    useEffect(() => {
        if (showNotification && !isError) {
            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showNotification, isError]);

    const fetchBookList = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
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
            setBookList(data);
            setFilteredBooks(data);
            setLoading(false);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setFilteredBooks(bookList);
            return;
        }

        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        const endpoint =
            searchType === "judul"
                ? `http://localhost:8080/api/books/search/judul?judul=${encodeURIComponent(searchTerm)}`
                : `http://localhost:8080/api/books/search/kategori?kategori=${encodeURIComponent(searchTerm)}`;

        try {
            setLoading(true);
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal mencari data buku - Status ${response.status}`);
            }

            const data: Books[] = await response.json();
            setFilteredBooks(data);
            setLoading(false);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mencari data");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setFilteredBooks(bookList);
    };

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newBook),
            });

            if (!response.ok) {
                throw new Error(`Gagal menambah buku - Status ${response.status}`);
            }

            await response.json();
            fetchBookList();
            setNewBook({
                judul: "",
                penerbit: "",
                tahunTerbit: new Date().getFullYear(),
                kategori: "",
                jumlahEksemplar: 1,
            });
            setShowAddForm(false);
            setNotificationMessage("Buku berhasil ditambahkan");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menambah buku");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleEditBook = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token || editBook.id === 0) {
            setNotificationMessage("Token tidak ditemukan atau ID buku tidak valid");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/books/${editBook.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editBook),
            });

            if (!response.ok) {
                throw new Error(`Gagal mengedit buku - Status ${response.status}`);
            }

            await response.json();
            fetchBookList();
            setEditBook({
                id: 0,
                judul: "",
                penerbit: "",
                tahunTerbit: new Date().getFullYear(),
                kategori: "",
                jumlahEksemplar: 1,
            });
            setShowEditForm(false);
            setNotificationMessage("Buku berhasil diperbarui");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengedit buku");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleDeleteBook = async () => {
        const token = Cookies.get("authToken");
        if (!token || deleteBookId === null) {
            setNotificationMessage("Token tidak ditemukan atau ID buku tidak valid");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/books/${deleteBookId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal menghapus buku - Status ${response.status}`);
            }

            await response.text();
            fetchBookList();
            setShowDeleteModal(false);
            setDeleteBookId(null);
            setNotificationMessage("Buku berhasil dihapus");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus buku");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleShowEditForm = (book: Books) => {
        setEditBook(book);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewBook((prev) => ({ ...prev, [name]: name === "tahunTerbit" || name === "jumlahEksemplar" ? parseInt(value) || 0 : value }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditBook((prev) => ({ ...prev, [name]: name === "tahunTerbit" || name === "jumlahEksemplar" ? parseInt(value) || 0 : value }));
    };

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Book className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Buku</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as "judul" | "kategori")}
                        className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        <option value="judul">Judul</option>
                        <option value="kategori">Kategori</option>
                    </select>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Cari berdasarkan ${searchType}`}
                            className="p-2 pl-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-64"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                    >
                        <Search className="w-4 h-4" /> Cari
                    </button>
                    <button
                        onClick={handleClearSearch}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                    >
                        <XCircle className="w-4 h-4" /> Clear
                    </button>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                        onClick={() => {
                            setShowAddForm(true);
                            setShowEditForm(false);
                        }}
                    >
                        <Plus className="w-4 h-4" /> Tambah Buku
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-700">
                            <Plus className="w-5 h-5" /> Tambah Buku Baru
                        </h2>
                        <form onSubmit={handleAddBook} className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                                <input
                                    type="text"
                                    name="judul"
                                    value={newBook.judul}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                                <input
                                    type="text"
                                    name="penerbit"
                                    value={newBook.penerbit}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                                <input
                                    type="number"
                                    name="tahunTerbit"
                                    value={newBook.tahunTerbit}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    name="kategori"
                                    value={newBook.kategori}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Eksemplar</label>
                                <input
                                    type="number"
                                    name="jumlahEksemplar"
                                    value={newBook.jumlahEksemplar}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                >
                                    <Save className="w-4 h-4" /> Simpan
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    <X className="w-4 h-4" /> Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-amber-700">
                            <Edit className="w-5 h-5" /> Edit Buku
                        </h2>
                        <form onSubmit={handleEditBook} className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                                <input
                                    type="text"
                                    name="judul"
                                    value={editBook.judul}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                                <input
                                    type="text"
                                    name="penerbit"
                                    value={editBook.penerbit}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                                <input
                                    type="number"
                                    name="tahunTerbit"
                                    value={editBook.tahunTerbit}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    name="kategori"
                                    value={editBook.kategori}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Eksemplar</label>
                                <input
                                    type="number"
                                    name="jumlahEksemplar"
                                    value={editBook.jumlahEksemplar}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="submit"
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                >
                                    <Save className="w-4 h-4" /> Update
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                    onClick={() => setShowEditForm(false)}
                                >
                                    <X className="w-4 h-4" /> Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
                            <Trash2 className="w-5 h-5" /> Konfirmasi Hapus
                        </h2>
                        <p className="mb-6 text-gray-600">Apakah Anda yakin ingin menghapus buku ini?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteBook}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                            >
                                <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                            >
                                <X className="w-4 h-4" /> Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className={`bg-white p-6 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isError ? 'border-l-4 border-red-600' : 'border-l-4 border-green-600'}`}>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {isError ? (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {isError ? "Error" : "Sukses"}
                        </h2>
                        <p className="mb-6 text-gray-600">{notificationMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowNotification(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                            >
                                <X className="w-4 h-4" /> Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {openInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-700">
                            <Info className="w-6 h-6" /> Detail Buku
                        </h2>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Judul Buku</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.judul}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Penerbit</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.penerbit}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Tahun Terbit</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.tahunTerbit}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Tags className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Kategori</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.kategori}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Layers className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Jumlah Eksemplar</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.jumlahEksemplar}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setOpenInfoModal(null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95"
                            >
                                <X className="w-4 h-4" /> Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showAddForm && !showEditForm && !showDeleteModal && !showNotification && !openInfoModal && (
                loading ? (
                    <div className="text-center text-gray-500 py-8">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        <p className="mt-2 font-medium">Memuat data buku...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden cursor-pointer">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">No</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Judul</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Penerbit</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tahun</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Jumlah</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data buku ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBooks.map((book, index) => (
                                        <tr
                                            key={book.id}
                                            className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-all duration-200 transform hover:shadow-md`}
                                        >
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {book.judul}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {book.penerbit}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {book.tahunTerbit}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {book.kategori}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {book.jumlahEksemplar}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 flex gap-2">
                                                <button
                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => handleShowEditForm(book)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => {
                                                        setDeleteBookId(book.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => setOpenInfoModal(book)}
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default BooksControllerAdmin;