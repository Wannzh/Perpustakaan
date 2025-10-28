import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Users, Plus, Search, X, Save, Trash2, Edit, XCircle, CheckCircle, AlertCircle, Info, BadgeInfo, BookOpen, ShieldCheck, UserCircle, Mail, User } from "lucide-react";

// Tipe data sesuai dengan SiswaResponseDTO di Java
interface Siswa {
    id: number;
    name: string;
    username: string;
    email: string;
    nis: string;
    userClass: string;
    role: string;
    active: boolean;
}

// Tipe data untuk SiswaRequestDTO
interface SiswaRequestDTO {
    name: string;
    username: string;
    password: string;
    email: string;
    nis: string;
    userClass: string;
    role: string;
    active: boolean;
}

const SiswaControllerPustkawan: React.FC = () => {
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [openInfoModal, setOpenInfoModal] = useState<Siswa | null>(null);
    const [newSiswa, setNewSiswa] = useState<SiswaRequestDTO>({
        name: "",
        username: "",
        password: "",
        email: "",
        nis: "",
        userClass: "",
        role: "SISWA",
        active: true,
    });
    const [editSiswa, setEditSiswa] = useState<SiswaRequestDTO>({
        name: "",
        username: "",
        password: "",
        email: "",
        nis: "",
        userClass: "",
        role: "SISWA",
        active: true,
    });
    const [editSiswaId, setEditSiswaId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchType, setSearchType] = useState<"nama" | "nis">("nama");

    useEffect(() => {
        fetchAllSiswa();
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

    const fetchAllSiswa = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
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
            setSiswaList(data);
            setLoading(false);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
        }
    };

    const handleAddSiswa = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/siswa/tambah", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newSiswa),
            });

            if (!response.ok) {
                throw new Error(`Gagal menambah siswa - Status ${response.status}`);
            }

            const addedSiswa: Siswa = await response.json();
            setSiswaList((prev) => [...prev, addedSiswa]);
            setNewSiswa({
                name: "",
                username: "",
                password: "",
                email: "",
                nis: "",
                userClass: "",
                role: "SISWA",
                active: true,
            });
            setShowAddForm(false);
            setNotificationMessage("Siswa berhasil ditambahkan");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menambah siswa");
            setIsError(true);
            setShowNotification(true);
        }
    };

    const handleEditSiswa = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token || editSiswaId === null) {
            setNotificationMessage("Token tidak ditemukan atau ID siswa tidak valid");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/siswa/edit/${editSiswaId}?status=${editSiswa.active}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editSiswa),
            });

            if (!response.ok) {
                throw new Error(`Gagal mengedit siswa - Status ${response.status}`);
            }

            const updatedSiswa: Siswa = await response.json();
            setSiswaList((prev) =>
                prev.map((siswa) => (siswa.id === editSiswaId ? updatedSiswa : siswa))
            );
            setEditSiswa({
                name: "",
                username: "",
                password: "",
                email: "",
                nis: "",
                userClass: "",
                role: "SISWA",
                active: true,
            });
            setEditSiswaId(null);
            setShowEditForm(false);
            setNotificationMessage("Siswa berhasil diperbarui");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengedit siswa");
            setIsError(true);
            setShowNotification(true);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSiswa((prev) => ({ ...prev, [name]: name === "active" ? value === "true" : value }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditSiswa((prev) => ({ ...prev, [name]: name === "active" ? value === "true" : value }));
    };

    const openEditForm = (siswa: Siswa) => {
        setEditSiswa({
            name: siswa.name,
            username: siswa.username,
            password: "",
            email: siswa.email,
            nis: siswa.nis,
            userClass: siswa.userClass,
            role: siswa.role,
            active: siswa.active,
        });
        setEditSiswaId(siswa.id);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchAllSiswa();
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
                ? `http://localhost:8080/api/siswa/search/nama?name=${encodeURIComponent(searchQuery)}`
                : `http://localhost:8080/api/siswa/search/nis?nis=${encodeURIComponent(searchQuery)}`;

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
                throw new Error(`Gagal mencari data siswa - Status ${response.status}`);
            }

            const data: Siswa[] = await response.json();
            setSiswaList(data);
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
        fetchAllSiswa();
    };

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Siswa</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as "nama" | "nis")}
                        className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        <option value="nama">Nama</option>
                        <option value="nis">NIS</option>
                    </select>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                        <Plus className="w-4 h-4" /> Tambah Siswa
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-700">
                            <Plus className="w-5 h-5" /> Tambah Siswa Baru
                        </h2>
                        <form onSubmit={handleAddSiswa} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newSiswa.name}
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
                                    value={newSiswa.username}
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
                                    value={newSiswa.password}
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
                                    value={newSiswa.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                                <input
                                    type="text"
                                    name="nis"
                                    value={newSiswa.nis}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                                <input
                                    type="text"
                                    name="userClass"
                                    value={newSiswa.userClass}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={newSiswa.role}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                >
                                    <option value="SISWA">SISWA</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="active"
                                    value={newSiswa.active.toString()}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                    required
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2 flex gap-3 justify-end">
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
                            <Edit className="w-5 h-5" /> Edit Siswa
                        </h2>
                        <form onSubmit={handleEditSiswa} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editSiswa.name}
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
                                    value={editSiswa.username}
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
                                    value={editSiswa.password}
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
                                    value={editSiswa.email}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                                <input
                                    type="text"
                                    name="nis"
                                    value={editSiswa.nis}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                                <input
                                    type="text"
                                    name="userClass"
                                    value={editSiswa.userClass}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={editSiswa.role}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                >
                                    <option value="SISWA">SISWA</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="active"
                                    value={editSiswa.active.toString()}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    required
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2 flex gap-3 justify-end">
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
                                        setEditSiswaId(null);
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
                        <p className="mb-6 text-gray-600">Apakah Anda yakin ingin menghapus siswa ini?</p>
                        <div className="flex gap-3 justify-end">
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
                            <Info className="w-6 h-6" /> Detail Siswa
                        </h2>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Nama</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCircle className="w-5 h-5 text-gray-500 mt-1" />
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
                                    <label className="block text-sm text-gray-500 mb-1">NIS</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.nis}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Kelas</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.userClass}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Role</label>
                                    <p className="text-gray-900 font-semibold capitalize">{openInfoModal.role}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Status</label>
                                    <p className="text-gray-900 font-semibold">{openInfoModal.active ? 'Aktif' : 'Tidak Aktif'}</p>
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
                        <p className="mt-2 font-medium">Memuat data siswa...</p>
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">NIS</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {siswaList.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data siswa ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    siswaList.map((siswa, index) => (
                                        <tr
                                            key={siswa.id}
                                            className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-all duration-200 transform hover:shadow-md`}
                                        >
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.name}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.username}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.email}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.nis}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.userClass}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.role}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                                {siswa.active ? 'Aktif' : 'Tidak Aktif'}
                                            </td>
                                            <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 flex gap-2">
                                                <button
                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => openEditForm(siswa)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                                                    onClick={() => setOpenInfoModal(siswa)}
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

export default SiswaControllerPustkawan;