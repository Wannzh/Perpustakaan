import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Users } from "lucide-react";

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
    const [editPustakawanId, setEditPustakawanId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchType, setSearchType] = useState<"nama" | "nip">("nama");

    useEffect(() => {
        fetchAllPustakawan();
    }, []);

    const fetchAllPustakawan = async () => {
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
            console.error("Error:", err);
            setLoading(false);
        }
    };

    const handleAddPustakawan = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
            console.log("Sukses menambah pustakawan:", addedPustakawan);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleEditPustakawan = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");

        if (!token || editPustakawanId === null) {
            console.error("Token tidak ditemukan atau ID pustakawan tidak valid");
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
            console.log("Sukses mengedit pustakawan:", updatedPustakawan);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleDeletePustakawan = async (id: number) => {
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/pustakawan/hapus/${id}`, {
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
            setPustakawanList((prev) => prev.filter((pustakawan) => pustakawan.id !== id));
            console.log("Sukses menghapus pustakawan");
        } catch (err) {
            console.error("Error:", err);
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

    const handleSearch = async () => {
        // Note: Search endpoints are not provided in the backend code, so this is a placeholder
        // If search endpoints like /pustakawan/search/nama or /pustakawan/search/nip exist, implement them here
        if (!searchQuery.trim()) {
            fetchAllPustakawan();
            return;
        }

        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
            return;
        }

        // Placeholder: Assuming search endpoints exist similar to SiswaController
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
            console.error("Error:", err);
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        fetchAllPustakawan();
    };

    return (
        <div className="p-6 gap-3 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center justify-center gap-1">
                    <Users className="w-5 h-5" />
                    <h1 className="text-2xl font-bold">Daftar Pustakawan</h1>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as "nama" | "nip")}
                        className="p-2 border rounded"
                    >
                        <option value="nama">Cari berdasarkan Nama</option>
                        <option value="nip">Cari berdasarkan NIP</option>
                    </select>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Masukkan ${searchType === "nama" ? "nama" : "NIP"} untuk mencari`}
                        className="p-2 border rounded"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Cari
                    </button>
                    <button
                        onClick={handleClearSearch}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Clear
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? "Cancel" : "Add Pustakawan +"}
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddPustakawan} className="bg-gray-50 p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Tambah Pustakawan Baru</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nama</label>
                            <input
                                type="text"
                                name="name"
                                value={newPustakawan.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={newPustakawan.username}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={newPustakawan.password}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={newPustakawan.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">NIP</label>
                            <input
                                type="text"
                                name="nip"
                                value={newPustakawan.nip}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Submit
                    </button>
                </form>
            )}

            {showEditForm && (
                <form onSubmit={handleEditPustakawan} className="bg-gray-50 p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Edit Pustakawan</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nama</label>
                            <input
                                type="text"
                                name="name"
                                value={editPustakawan.name}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={editPustakawan.username}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Password (Kosongkan jika tidak diubah)</label>
                            <input
                                type="password"
                                name="password"
                                value={editPustakawan.password}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Masukkan password baru jika ingin mengubah"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={editPustakawan.email}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">NIP</label>
                            <input
                                type="text"
                                name="nip"
                                value={editPustakawan.nip}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
                        >
                            Update
                        </button>
                        <button
                            type="button"
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            onClick={() => {
                                setShowEditForm(false);
                                setEditPustakawanId(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="text-center text-gray-500">Loading data pustakawan...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Nama</th>
                                <th className="border px-4 py-2">Username</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">NIP</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pustakawanList.map((pustakawan) => (
                                <tr key={pustakawan.id} className="text-center">
                                    <td className="border px-4 py-2">{pustakawan.id}</td>
                                    <td className="border px-4 py-2">{pustakawan.name}</td>
                                    <td className="border px-4 py-2">{pustakawan.username}</td>
                                    <td className="border px-4 py-2">{pustakawan.email}</td>
                                    <td className="border px-4 py-2">{pustakawan.nip}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            className="bg-red-500 text-white p-0.5 rounded-md mr-2"
                                            onClick={() => handleDeletePustakawan(pustakawan.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="bg-amber-500 text-white p-0.5 rounded-md"
                                            onClick={() => openEditForm(pustakawan)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PustakawanController;