import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Users, Plus, Search, X, Save, Trash2, Edit, XCircle, CheckCircle, AlertCircle, Info, BadgeInfo, Mail, User } from "lucide-react";

// Tipe data sesuai dengan PustakawanResponseDTO di Java
interface Pustakawan {
    id: number;
    name: string;
    username: string;
    email: string;
    nip: string;
}

// Tipe data untuk PustakawanRequestDTO
interface PustakawanRequestDTO {
    name: string;
    username: string;
    password: string;
    email: string;
    nip: string;
}

const PustakawanController: React.FC = () => {
    const [pustakawanList, setPustakawanList] = useState<Pustakawan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [deletePustakawanId, setDeletePustakawanId] = useState<number | null>(null);
    const [newPustakawan, setNewPustakawan] = useState<PustakawanRequestDTO>({
        name: "",
        username: "",
        password: "",
        email: "",
        nip: "",
    });
    const [editPustakawan, setEditPustakawan] = useState<PustakawanRequestDTO>({
        name: "",
        username: "",
        password: "",
        email: "",
        nip: "",
    });
    const [openInfoModal, setOpenInfoModal] = useState<Pustakawan | null>(null);
    const [editPustakawanId, setEditPustakawanId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchType, setSearchType] = useState<"nama" | "nip">("nama");

    useEffect(() => {
        fetchAllPustakawan();
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

    const fetchAllPustakawan = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
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
            setPustakawanList(data);
            setLoading(false);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
        }
    };

    const handleAddPustakawan = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/admin/pustakawan/tambah", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newPustakawan),
            });

            if (!response.ok) {
                throw new Error(`Gagal menambah pustakawan - Status ${response.status}`);
            }

            const addedPustakawan: Pustakawan = await response.json();
            setPustakawanList((prev) => [...prev, addedPustakawan]);
            setNewPustakawan({
                name: "",
                username: "",
                password: "",
                email: "",
                nip: "",
            });
            setShowAddForm(false);
            setNotificationMessage("Pustakawan berhasil ditambahkan");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menambah pustakawan");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleEditPustakawan = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token || editPustakawanId === null) {
            setNotificationMessage("Token tidak ditemukan atau ID pustakawan tidak valid");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/pustakawan/edit/${editPustakawanId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editPustakawan),
            });

            if (!response.ok) {
                throw new Error(`Gagal mengedit pustakawan - Status ${response.status}`);
            }

            const updatedPustakawan: Pustakawan = await response.json();
            setPustakawanList((prev) =>
                prev.map((pustakawan) => (pustakawan.id === editPustakawanId ? updatedPustakawan : pustakawan))
            );
            setEditPustakawan({
                name: "",
                username: "",
                password: "",
                email: "",
                nip: "",
            });
            setEditPustakawanId(null);
            setShowEditForm(false);
            setNotificationMessage("Pustakawan berhasil diperbarui");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengedit pustakawan");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleDeletePustakawan = async () => {
        const token = Cookies.get("authToken");
        if (!token || deletePustakawanId === null) {
            setNotificationMessage("Token tidak ditemukan atau ID pustakawan tidak valid");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/pustakawan/hapus/${deletePustakawanId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal menghapus pustakawan - Status ${response.status}`);
            }

            await response.text();
            setPustakawanList((prev) => prev.filter((pustakawan) => pustakawan.id !== deletePustakawanId));
            setShowDeleteModal(false);
            setDeletePustakawanId(null);
            setNotificationMessage("Pustakawan berhasil dihapus");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus pustakawan");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPustakawan((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditPustakawan((prev) => ({ ...prev, [name]: value }));
    };

    const openEditForm = (pustakawan: Pustakawan) => {
        setEditPustakawan({
            name: pustakawan.name,
            username: pustakawan.username,
            password: "",
            email: pustakawan.email,
            nip: pustakawan.nip,
        });
        setEditPustakawanId(pustakawan.id);
        setShowEditForm(true);
    };

    const openDeleteModal = (id: number) => {
        setDeletePustakawanId(id);
        setShowDeleteModal(true);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchAllPustakawan();
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
            searchType === "nama"
                ? `http://localhost:8080/api/admin/pustakawan/search/nama?name=${encodeURIComponent(searchQuery)}`
                : `http://localhost:8080/api/admin/pustakawan/search/nip?nip=${encodeURIComponent(searchQuery)}`;

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
                throw new Error(`Gagal mencari data pustakawan - Status ${response.status}`);
            }

            const data: Pustakawan[] = await response.json();
            setPustakawanList(data);
            setLoading(false);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mencari data");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        fetchAllPustakawan();
    };

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Pustakawan</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as "nama" | "nip")}
                        className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        <option value="nama">Nama</option>
                        <option value="nip">NIP</option>
                    </select>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Cari berdasarkan ${searchType}`}
                            className="p-2 pl-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="w-4 h-4" /> Tambah Pustakawan
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-700">
                            <Plus className="w-5 h-5" /> Tambah Pustakawan Baru
                        </h2>
                        <form onSubmit={handleAddPustakawan} className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newPustakawan.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newPustakawan.username}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newPustakawan.password}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newPustakawan.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                                <input
                                    type="text"
                                    name="nip"
                                    value={newPustakawan.nip}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
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
                            <Edit className="w-5 h-5" /> Edit Pustakawan
                        </h2>
                        <form onSubmit={handleEditPustakawan} className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editPustakawan.name}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editPustakawan.username}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password (Kosongkan jika tidak diubah)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editPustakawan.password}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    placeholder="Masukkan password baru jika ingin mengubah"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editPustakawan.email}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                                <input
                                    type="text"
                                    name="nip"
                                    value={editPustakawan.nip}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
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
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditPustakawanId(null);
                                    }}
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
                        <p className="mb-6 text-gray-600">Apakah Anda yakin ingin menghapus pustakawan ini?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeletePustakawan}
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
                            <Info className="w-6 h-6" /> Detail Pustakawan
                        </h2>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block t
ext-sm text-gray-500 mb-1">Nama</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Username</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.username}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BadgeInfo className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">NIP</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.nip}</p>
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
                        <p className="mt-2 font-medium">Memuat data pustakawan...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden cursor-pointer">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">No</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">NIP</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pustakawanList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data pustakawan ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    pustakawanList.map((pustakawan, index) => (
                                        <tr
                                            key={pustakawan.id}
                                            className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-all duration-200 transform hover:shadow-md`}
                                        >
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {pustakawan.name}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {pustakawan.username}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {pustakawan.email}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {pustakawan.nip}
                                            </td>
                                            <td className="whitespace-nowrap.obreak text-sm text-gray-900 px-6 py-4 flex gap-2">
                                                <button
                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => openEditForm(pustakawan)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => openDeleteModal(pustakawan.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => setOpenInfoModal(pustakawan)}
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

export default PustakawanController;