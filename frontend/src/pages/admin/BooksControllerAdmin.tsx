import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Book, Search, Plus, X, Save, Trash2, Edit, AlertTriangle } from "lucide-react";

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
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [bookList, setBookList] = useState<Books[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Books[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [editBook, setEditBook] = useState<Books>({
        id: 0,
        judul: "",
        penerbit: "",
        tahunTerbit: new Date().getFullYear(),
        kategori: "",
        jumlahEksemplar: 1,
    });
    const [newBook, setNewBook] = useState<BooksRequestDTO>({
        judul: "",
        penerbit: "",
        tahunTerbit: new Date().getFullYear(),
        kategori: "",
        jumlahEksemplar: 1,
    });
    const [showConfirm, setShowConfirm] = useState<{
        show: boolean;
        type: "add" | "edit" | "delete" | null;
        id?: number;
    }>({ show: false, type: null });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchBookList();
    }, []);

    useEffect(() => {
        const filtered = bookList.filter(
            (book) =>
                book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.kategori.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBooks(filtered);
    }, [searchTerm, bookList]);

    const fetchBookList = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            setLoading(false);
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
            setFilteredBooks(data);
            setLoading(false);
        } catch (err) {
            console.error("Error:", err);
            setLoading(false);
        }
    };

    const handleAddBook = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            setShowConfirm({ show: false, type: null });
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
            setShowConfirm({ show: false, type: null });
        } catch (err) {
            console.error("Error:", err);
            setShowConfirm({ show: false, type: null });
        }
    };

    const handleDeleteBook = async (id: number) => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            setShowConfirm({ show: false, type: null });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/books/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal menghapus buku - Status ${response.status}`);
            }

            fetchBookList();
            setShowConfirm({ show: false, type: null });
        } catch (err) {
            console.error("Error:", err);
            setShowConfirm({ show: false, type: null });
        }
    };

    const handleEditBook = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            setShowConfirm({ show: false, type: null });
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

            fetchBookList();
            setShowEditForm(false);
            setEditBook({
                id: 0,
                judul: "",
                penerbit: "",
                tahunTerbit: new Date().getFullYear(),
                kategori: "",
                jumlahEksemplar: 1,
            });
            setShowConfirm({ show: false, type: null });
        } catch (err) {
            console.error("Error:", err);
            setShowConfirm({ show: false, type: null });
        }
    };

    const handleShowEditForm = (book: Books) => {
        setEditBook(book);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const confirmAction = async () => {
        if (showConfirm.type === "add") {
            await handleAddBook();
        } else if (showConfirm.type === "edit") {
            await handleEditBook();
        } else if (showConfirm.type === "delete" && showConfirm.id !== undefined) {
            await handleDeleteBook(showConfirm.id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Book className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-3xl font-bold text-gray-800">Manajemen Buku</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan judul atau kategori..."
                                className="pl-10 p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                            onClick={() => {
                                setShowAddForm(!showAddForm);
                                setShowEditForm(false);
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            {showAddForm ? "Batal" : "Tambah Buku"}
                        </button>
                    </div>
                </div>

                {showAddForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Tambah Buku Baru</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setShowConfirm({ show: true, type: "add" });
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul Buku</label>
                                <input
                                    type="text"
                                    placeholder="Judul Buku"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newBook.judul}
                                    onChange={(e) => setNewBook({ ...newBook, judul: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Penerbit</label>
                                <input
                                    type="text"
                                    placeholder="Penerbit"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newBook.penerbit}
                                    onChange={(e) => setNewBook({ ...newBook, penerbit: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Terbit</label>
                                <input
                                    type="number"
                                    placeholder="Tahun Terbit"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newBook.tahunTerbit}
                                    onChange={(e) => setNewBook({ ...newBook, tahunTerbit: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input
                                    type="text"
                                    placeholder="Kategori"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newBook.kategori}
                                    onChange={(e) => setNewBook({ ...newBook, kategori: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Eksemplar</label>
                                <input
                                    type="number"
                                    placeholder="Jumlah Eksemplar"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newBook.jumlahEksemplar}
                                    onChange={(e) => setNewBook({ ...newBook, jumlahEksemplar: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    <X className="w-5 h-5" />
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showEditForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Buku</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setShowConfirm({ show: true, type: "edit" });
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul Buku</label>
                                <input
                                    type="text"
                                    placeholder="Judul Buku"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={editBook.judul}
                                    onChange={(e) => setEditBook({ ...editBook, judul: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Penerbit</label>
                                <input
                                    type="text"
                                    placeholder="Penerbit"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={editBook.penerbit}
                                    onChange={(e) => setEditBook({ ...editBook, penerbit: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Terbit</label>
                                <input
                                    type="number"
                                    placeholder="Tahun Terbit"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={editBook.tahunTerbit}
                                    onChange={(e) => setEditBook({ ...editBook, tahunTerbit: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input
                                    type="text"
                                    placeholder="Kategori"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={editBook.kategori}
                                    onChange={(e) => setEditBook({ ...editBook, kategori: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Eksemplar</label>
                                <input
                                    type="number"
                                    placeholder="Jumlah Eksemplar"
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={editBook.jumlahEksemplar}
                                    onChange={(e) => setEditBook({ ...editBook, jumlahEksemplar: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Update
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                                    onClick={() => setShowEditForm(false)}
                                >
                                    <X className="w-5 h-5" />
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showConfirm.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Konfirmasi {showConfirm.type === "add" ? "Tambah" : showConfirm.type === "edit" ? "Edit" : "Hapus"} Buku
                                </h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin {showConfirm.type === "add" ? "menambahkan" : showConfirm.type === "edit" ? "mernyakan" : "menghapus"} buku ini?
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                                    onClick={() => setShowConfirm({ show: false, type: null })}
                                >
                                    <X className="w-5 h-5" />
                                    Batal
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                    onClick={confirmAction}
                                >
                                    <Save className="w-5 h-5" />
                                    Ya, {showConfirm.type === "add" ? "Tambah" : showConfirm.type === "edit" ? "Update" : "Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerbit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data buku ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBooks.map((book, index) => (
                                        <tr key={book.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.judul}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.penerbit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.tahunTerbit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.kategori}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.jumlahEksemplar}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                                                <button
                                                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition duration-200"
                                                    onClick={() => handleShowEditForm(book)}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition duration-200"
                                                    onClick={() => setShowConfirm({ show: true, type: "delete", id: book.id })}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksControllerAdmin;