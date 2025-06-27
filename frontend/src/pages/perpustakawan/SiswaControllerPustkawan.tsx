import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Users } from "lucide-react";

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

const SiswaControllerPustkawan = () => {
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
        const token = Cookies.get("authToken");

        if (!token) {
            console.error("Token tidak ditemukan di cookie");
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
            });
            setShowAddForm(false);
            console.log("Sukses menambah siswa:", addedSiswa);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleEditSiswa = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");

        if (!token || editSiswaId === null) {
            console.error("Token tidak ditemukan atau ID siswa tidak valid");
            return;
        }

        try {
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
        } catch (err) {
            console.error("Error:", err);
        }
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
        <div className="p-6 gap-3 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center justify-center gap-1">
                    <Users className="w-5 h-5" />
                    <h1 className="text-2xl font-bold">Daftar Siswa</h1>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as "nama" | "nis")}
                        className="p-2 border rounded"
                    >
                        <option value="nama">Cari berdasarkan Nama</option>
                        <option value="nis">Cari berdasarkan NIS</option>
                    </select>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Masukkan ${searchType === "nama" ? "nama" : "NIS"} untuk mencari`}
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
                        {showAddForm ? "Cancel" : "Add Siswa +"}
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddSiswa} className="bg-gray-50 p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Tambah Siswa Baru</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nama</label>
                            <input
                                type="text"
                                name="name"
                                value={newSiswa.name}
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
                                value={newSiswa.username}
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
                                value={newSiswa.password}
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
                                value={newSiswa.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">NIS</label>
                            <input
                                type="text"
                                name="nis"
                                value={newSiswa.nis}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Kelas</label>
                            <input
                                type="text"
                                name="userClass"
                                value={newSiswa.userClass}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select
                                name="role"
                                value={newSiswa.role}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="SISWA">SISWA</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
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
                <form onSubmit={handleEditSiswa} className="bg-gray-50 p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Edit Siswa</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nama</label>
                            <input
                                type="text"
                                name="name"
                                value={editSiswa.name}
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
                                value={editSiswa.username}
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
                                value={editSiswa.password}
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
                                value={editSiswa.email}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">NIS</label>
                            <input
                                type="text"
                                name="nis"
                                value={editSiswa.nis}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Kelas</label>
                            <input
                                type="text"
                                name="userClass"
                                value={editSiswa.userClass}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select
                                name="role"
                                value={editSiswa.role}
                                onChange={handleEditInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="SISWA">SISWA</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
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
                                setEditSiswaId(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>Loading data siswa...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Nama</th>
                                <th className="border px-4 py-2">Username</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">NIS</th>
                                <th className="border px-4 py-2">Kelas</th>
                                <th className="border px-4 py-2">Role</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {siswaList.map((siswa) => (
                                <tr key={siswa.id} className="text-center">
                                    <td className="border px-4 py-2">{siswa.id}</td>
                                    <td className="border px-4 py-2">{siswa.name}</td>
                                    <td className="border px-4 py-2">{siswa.username}</td>
                                    <td className="border px-4 py-2">{siswa.email}</td>
                                    <td className="border px-4 py-2">{siswa.nis}</td>
                                    <td className="border px-4 py-2">{siswa.userClass}</td>
                                    <td className="border px-4 py-2">{siswa.role}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            className="bg-red-500 text-white p-0.5 rounded-md"
                                            onClick={() => handleDeleteSiswa(siswa.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="ml-2 p-0.5 bg-amber-500 rounded-md"
                                            onClick={() => openEditForm(siswa)}
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

export default SiswaControllerPustkawan;