import { useEffect, useState } from "react";
import Cookies from "js-cookie";

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

    useEffect(() => {
        fetchBookList();
    }, []);

    useEffect(() => {
        // Filter books based on search term
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
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleAddBook = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleDeleteBook = async (id: number) => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            return;
        }

        if (!window.confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

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
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleEditBook = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleShowEditForm = (book: Books) => {
        setEditBook(book);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Buku</h2>
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-300"
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setShowEditForm(false);
                    }}
                >
                    {showAddForm ? "Tutup Form" : "Tambah Buku +"}
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Cari berdasarkan judul atau kategori..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {(showAddForm || showEditForm) && (
                <div className="mb-8 p-6 bg-white rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{showEditForm ? "Edit Buku" : "Tambah Buku Baru"} </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Judul Buku"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={showEditForm ? editBook.judul : newBook.judul}
                            onChange={(e) =>
                                showEditForm
                                    ? setEditBook({ ...editBook, judul: e.target.value })
                                    : setNewBook({ ...newBook, judul: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Penerbit"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={showEditForm ? editBook.penerbit : newBook.penerbit}
                            onChange={(e) =>
                                showEditForm
                                    ? setEditBook({ ...editBook, penerbit: e.target.value })
                                    : setNewBook({ ...newBook, penerbit: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Tahun Terbit"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={showEditForm ? editBook.tahunTerbit : newBook.tahunTerbit}
                            onChange={(e) =>
                                showEditForm
                                    ? setEditBook({ ...editBook, tahunTerbit: parseInt(e.target.value) })
                                    : setNewBook({ ...newBook, tahunTerbit: parseInt(e.target.value) })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Kategori"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={showEditForm ? editBook.kategori : newBook.kategori}
                            onChange={(e) =>
                                showEditForm
                                    ? setEditBook({ ...editBook, kategori: e.target.value })
                                    : setNewBook({ ...newBook, kategori: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Jumlah Eksemplar"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={showEditForm ? editBook.jumlahEksemplar : newBook.jumlahEksemplar}
                            onChange={(e) =>
                                showEditForm
                                    ? setEditBook({ ...editBook, jumlahEksemplar: parseInt(e.target.value) })
                                    : setNewBook({ ...newBook, jumlahEksemplar: parseInt(e.target.value) })
                            }
                        />
                    </div>
                    <div className="mt-6 flex gap-4">
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition duration-300"
                            onClick={showEditForm ? handleEditBook : handleAddBook}
                        >
                            {showEditForm ? "Simpan Perubahan" : "Tambah Buku"}
                        </button>
                        <button
                            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded-lg transition duration-300"
                            onClick={() => {
                                setShowAddForm(false);
                                setShowEditForm(false);
                            }}
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left">ID</th>
                            <th className="px-6 py-3 text-left">Judul</th>
                            <th className="px-6 py-3 text-left">Penerbit</th>
                            <th className="px-6 py-3 text-left">Tahun</th>
                            <th className="px-6 py-3 text-left">Kategori</th>
                            <th className="px-6 py-3 text-left">Jumlah</th>
                            <th className="px-6 py-3 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4 text-gray-500">
                                    Tidak ada data buku ditemukan
                                </td>
                            </tr>
                        ) : (
                            filteredBooks.map((book) => (
                                <tr key={book.id} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-4">{book.id}</td>
                                    <td className="px-6 py-4">{book.judul}</td>
                                    <td className="px-6 py-4">{book.penerbit}</td>
                                    <td className="px-6 py-4">{book.tahunTerbit}</td>
                                    <td className="px-6 py-4">{book.kategori}</td>
                                    <td className="px-6 py-4">{book.jumlahEksemplar}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-3 rounded-lg transition duration-300"
                                            onClick={() => handleShowEditForm(book)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg transition duration-300"
                                            onClick={() => handleDeleteBook(book.id)}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BooksControllerAdmin;