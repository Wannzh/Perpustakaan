import { useState } from "react";
import Cookies from "js-cookie";
import { Plus, Save, X, CheckCircle, AlertCircle } from "lucide-react";

interface PeminjamanRequestDTO {
    siswaId: number;
    bukuId: number;
    tanggalPinjam: string;
    tanggalJatuhTempo: string;
}

const LoansBooksPustakawan: React.FC = () => {
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [newLoan, setNewLoan] = useState<PeminjamanRequestDTO>({
        siswaId: 0,
        bukuId: 0,
        tanggalPinjam: new Date().toISOString().split("T")[0],
        tanggalJatuhTempo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewLoan((prev) => ({
            ...prev,
            [name]: name === "siswaId" || name === "bukuId" ? parseInt(value) || 0 : value,
        }));
    };

    const handleAddLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("authToken");
        if (!token) {
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/peminjaman/manual/tambah", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newLoan),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gagal menambah peminjaman - ${errorData.message}`);
            }

            await response.json();
            setNewLoan({
                siswaId: 0,
                bukuId: 0,
                tanggalPinjam: new Date().toISOString().split("T")[0],
                tanggalJatuhTempo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            });
            setShowAddForm(false);
            setNotificationMessage("Peminjaman berhasil ditambahkan");
            setIsError(false);
            setShowNotification(true);
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menambah peminjaman");
            setIsError(true);
            setShowNotification(true);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Plus className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Peminjaman Manual</h1>
                </div>
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus className="w-4 h-4" /> {showAddForm ? "Tutup" : "Tambah Peminjaman"}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 transform transition-all duration-300">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-700">
                        <Plus className="w-5 h-5" /> Tambah Peminjaman Baru
                    </h2>
                    <form onSubmit={handleAddLoan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Siswa</label>
                            <input
                                type="number"
                                name="siswaId"
                                value={newLoan.siswaId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Buku</label>
                            <input
                                type="number"
                                name="bukuId"
                                value={newLoan.bukuId}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                            <input
                                type="date"
                                name="tanggalPinjam"
                                value={newLoan.tanggalPinjam}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jatuh Tempo</label>
                            <input
                                type="date"
                                name="tanggalJatuhTempo"
                                value={newLoan.tanggalJatuhTempo}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex gap-3">
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
            )}

            {showNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div
                        className={`bg-white p-6 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isError ? "border-l-4 border-red-600" : "border-l-4 border-green-600"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {isError ? (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {isError ? "Error" : "Sukses"}
                        </h2>
                        <p className="mb-6 text-gray-600">{notificationMessage}</p>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                        >
                            <X className="w-4 h-4" /> Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansBooksPustakawan;