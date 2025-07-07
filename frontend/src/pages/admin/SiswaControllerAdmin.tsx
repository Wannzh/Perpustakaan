import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Users, Search, Plus, X, Save, Trash2, Edit, AlertTriangle } from "lucide-react";

// Tipe data sesuai dengan SiswaResponseDTO di Java
interface Siswa {
    id: number;
    name: string;
    username: string;
    email: string;
    nis: string;
    userClass: string;
    role: string;
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
}

const SiswaControllerAdmin = () => {
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [newSiswa, setNewSiswa] = useState<SiswaRequestDTO>({
        name: "",
        username: "",
        password: "",
        email: "",
        nis: "",
        userClass: "",
        role: "SISWA",
    });
    const [editSiswa, setEditSiswa] = useState<SiswaRequestDTO>({
        name: "",
        username: "",
        password: "",
        email: "",
        nis: "",
        userClass: "",
        role: "SISWA",
    });
    const [editSiswaId, setEditSiswaId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchType, setSearchType] = useState<"nama" | "nis">("nama");
    const [showConfirm, setShowConfirm] = useState<{
        show: boolean;
        type: "add" | "edit" | "delete" | null;
        id?: number;
    }>({ show: false, type: null });

    useEffect(() => {
        fetchAllSiswa();
    }, []);

    const fetchAllSiswa = async () => {
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
            console.error("Error:", err);
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchAllSiswa();
            return;
        }

        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
            console.error("Error:", err);
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        fetchAllSiswa();
    };

    const handleDeleteSiswa = async (id: number) => {
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/siswa/hapus/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal menghapus data siswa - Status ${response.status}`);
            }

            await response.text();
            setSiswaList((prev) => prev.filter((siswa) => siswa.id !== id));
            console.log("Sukses menghapus siswa");
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleAddSiswa = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm({ show: true, type: "add" });
    };

    const handleEditSiswa = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm({ show: true, type: "edit" });
    };

    const confirmAction = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            setShowConfirm({ show: false, type: null });
            return;
        }

        try {
            if (showConfirm.type === "add") {
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
                });
                setShowAddForm(false);
                console.log("Sukses menambah siswa:", addedSiswa);
            } else if (showConfirm.type === "edit" && editSiswaId !== null) {
                const response = await fetch(`http://localhost:8080/api/siswa/edit/${editSiswaId}`, {
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
                });
                setEditSiswaId(null);
                setShowEditForm(false);
                console.log("Sukses mengedit siswa:", updatedSiswa);
            } else if (showConfirm.type === "delete" && showConfirm.id !== undefined) {
                await handleDeleteSiswa(showConfirm.id);
            }
        } catch (err) {
            console.error("Error:", err);
        }
        setShowConfirm({ show: false, type: null });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSiswa((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditSiswa((prev) => ({ ...prev, [name]: value }));
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
        });
        setEditSiswaId(siswa.id);
        setShowEditForm(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Siswa</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value as "nama" | "nis")}
                                className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="nama">Nama</option>
                                <option value="nis">NIS</option>
                            </select>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Cari berdasarkan ${searchType === "nama" ? "nama" : "NIS"}`}
                                    className="pl-10 p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Cari
                            </button>
                            <button
                                onClick={handleClearSearch}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                            >
                                Reset
                            </button>
                        </div>
                        <button
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            <Plus className="w-5 h-5" />
                            {showAddForm ? "Batal" : "Tambah Siswa"}
                        </button>
                    </div>
                </div>

                {showAddForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tambah Siswa Baru</h2>
                        <form onSubmit={handleAddSiswa} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newSiswa.name}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newSiswa.username}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newSiswa.password}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newSiswa.email}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIS</label>
                                <input
                                    type="text"
                                    name="nis"
                                    value={newSiswa.nis}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                                <input
                                    type="text"
                                    name="userClass"
                                    value={newSiswa.userClass}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    name="role"
                                    value={newSiswa.role}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="SISWA">SISWA</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
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
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Siswa</h2>
                        <form onSubmit={handleEditSiswa} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editSiswa.name}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editSiswa.username}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password (Kosongkan jika tidak diubah)
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editSiswa.password}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Masukkan password baru jika ingin mengubah"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editSiswa.email}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIS</label>
                                <input
                                    type="text"
                                    name="nis"
                                    value={editSiswa.nis}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                                <input
                                    type="text"
                                    name="userClass"
                                    value={editSiswa.userClass}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    name="role"
                                    value={editSiswa.role}
                                    onChange={handleEditInputChange}
                                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="SISWA">SISWA</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
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
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditSiswaId(null);
                                    }}
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
                                    Konfirmasi {showConfirm.type === "add" ? "Tambah" : showConfirm.type === "edit" ? "Edit" : "Hapus"} Siswa
                                </h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin {showConfirm.type === "add" ? "menambahkan" : showConfirm.type === "edit" ? "mengedit" : "menghapus"} siswa ini?
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {siswaList.map((siswa, index) => (
                                    <tr key={siswa.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.nis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.userClass}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.role}</td>
                                        <td className="px-6 py-4 flex gap-2 whitespace-nowrap text-sm text-gray-900">
                                            <button
                                                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition duration-200"
                                                onClick={() => openEditForm(siswa)}
                                            >
                                                <Edit className="w-4 h-4" /> 
                                            </button>
                                            <button
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition duration-200"
                                                onClick={() => setShowConfirm({ show: true, type: "delete", id: siswa.id })}
                                            >
                                                <Trash2 className="w-5 h-5" /> 
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiswaControllerAdmin;