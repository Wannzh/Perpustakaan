import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Plus, Save, X, Edit } from "lucide-react";
import { parse, isBefore, format } from "date-fns";
import { id } from "date-fns/locale";

interface PeminjamanRequestDTO {
    siswaId: string;
    bukuId: number;
    tanggalPinjam: string;
    tanggalJatuhTempo: string;
}

interface PengembalianRequestDTO {
    transactionId: number;
    statusPengembalian: string;
    catatan?: string;
}

interface BookLoan {
    id: number;
    idSiswa: string;
    judulBuku: string;
    namaSiswa: string;
    status: string;
    statusPengembalian: string;
    tanggalPinjam: string;
    tanggalKembali: string;
    tanggalJatuhTempo: string;
}

const API_BASE_URL = "http://localhost:8080";

const RETURN_STATUS = ["NORMAL", "HILANG", "RUSAK"];

const LoansBooksPustakawan: React.FC = () => {
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [addNotification, setAddNotification] = useState<{ show: boolean; message: string; isSuccess: boolean }>({ show: false, message: "", isSuccess: true });
    const [editNotification, setEditNotification] = useState<{ show: boolean; message: string; isSuccess: boolean }>({ show: false, message: "", isSuccess: true });
    const [dataPeminjaman, setDataPeminjaman] = useState<BookLoan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [newLoan, setNewLoan] = useState<PeminjamanRequestDTO>({
        siswaId: "",
        bukuId: 0,
        tanggalPinjam: format(new Date(), "yyyy-MM-dd", { locale: id }),
        tanggalJatuhTempo: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd", { locale: id }),
    });
    const [editLoan, setEditLoan] = useState<PengembalianRequestDTO>({
        transactionId: 0,
        statusPengembalian: RETURN_STATUS[0],
        catatan: "",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof PeminjamanRequestDTO | keyof PengembalianRequestDTO, string>>>({});

    useEffect(() => {
        fetchLoanList();
    }, []);

    useEffect(() => {
        if (addNotification.show) {
            const timer = setTimeout(() => {
                setAddNotification({ show: false, message: "", isSuccess: true });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [addNotification.show]);

    useEffect(() => {
        if (editNotification.show) {
            const timer = setTimeout(() => {
                setEditNotification({ show: false, message: "", isSuccess: true });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [editNotification.show]);

    const fetchLoanList = async () => {
        try {
            const token = Cookies.get("authToken");
            if (!token) {
                setAddNotification({ show: true, message: "Token tidak ditemukan di cookie", isSuccess: false });
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/peminjaman/manual/all?page=0&size=100&sortBy=tanggalPinjam&direction=desc`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Gagal mengambil data peminjaman - Status ${response.status}`);
            }

            const data = await response.json();
            setDataPeminjaman(data.content || []);
            console.log("Loan statuses:", data.content.map((loan: BookLoan) => loan.status));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data peminjaman:", err);
            setAddNotification({ show: true, message: err instanceof Error ? err.message : "Gagal mengambil data peminjaman", isSuccess: false });
            setLoading(false);
        }
    };

    const validateAddForm = (): boolean => {
        const newErrors: Partial<Record<keyof PeminjamanRequestDTO, string>> = {};
        if (newLoan.siswaId == "") {
            newErrors.siswaId = "ID Siswa harus lebih besar dari 0";
        }
        if (newLoan.bukuId <= 0) {
            newErrors.bukuId = "ID Buku harus lebih besar dari 0";
        }
        if (newLoan.tanggalPinjam === "") {
            newErrors.tanggalPinjam = "Tanggal Pinjam wajib diisi";
        }
        if (newLoan.tanggalJatuhTempo === "") {
            newErrors.tanggalJatuhTempo = "Tanggal Jatuh Tempo wajib diisi";
        } else {
            const pinjamDate = parse(newLoan.tanggalPinjam, "yyyy-MM-dd", new Date());
            const jatuhTempoDate = parse(newLoan.tanggalJatuhTempo, "yyyy-MM-dd", new Date());
            if (isBefore(jatuhTempoDate, pinjamDate)) {
                newErrors.tanggalJatuhTempo = "Tanggal Jatuh Tempo harus setelah Tanggal Pinjam";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEditForm = (): boolean => {
        const newErrors: Partial<Record<keyof PengembalianRequestDTO, string>> = {};

        if (!editLoan.transactionId || editLoan.transactionId <= 0) {
            newErrors.transactionId = "ID Transaksi tidak valid";
        }

        if (!editLoan.statusPengembalian) {
            newErrors.statusPengembalian = "Status Pengembalian wajib diisi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewLoan((prev) => ({
            ...prev,
            [name]: name === "bukuId" ? parseInt(value) || 0 : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditLoan((prev) => ({
            ...prev,
            [name]: name === "transactionId" ? parseInt(value) || 0 : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleAddLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAddForm()) {
            return;
        }

        const token = Cookies.get("authToken");
        if (!token) {
            setAddNotification({ show: true, message: "Token tidak ditemukan di cookie", isSuccess: false });
            return;
        }

        setFormLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/peminjaman/manual/tambah`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newLoan),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Gagal menambah peminjaman - Status ${response.status}`);
            }

            await response.json();
            setNewLoan({
                siswaId: "",
                bukuId: 0,
                tanggalPinjam: format(new Date(), "yyyy-MM-dd", { locale: id }),
                tanggalJatuhTempo: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd", { locale: id }),
            });
            setShowAddForm(false);
            setAddNotification({ show: true, message: "Peminjaman berhasil ditambahkan", isSuccess: true });
            fetchLoanList();
        } catch (err) {
            setAddNotification({ show: true, message: err instanceof Error ? err.message : "Terjadi kesalahan saat menambah peminjaman", isSuccess: false });
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditLoan = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEditForm()) {
            return;
        }

        const token = Cookies.get("authToken");
        if (!token) {
            setEditNotification({ show: true, message: "Token tidak ditemukan di cookie", isSuccess: false });
            return;
        }

        setFormLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pengembalian/manual`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    transactionId: editLoan.transactionId,
                    statusPengembalian: editLoan.statusPengembalian,
                    catatan: editLoan.catatan || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData?.message || `Gagal mengedit pengembalian. Status: ${response.status}`;
                throw new Error(errorMessage);
            }

            const successMessage = "Pengembalian berhasil diperbarui";
            console.log("Edit message:", successMessage);
            localStorage.setItem("lastEditMessage", JSON.stringify({
                message: successMessage,
                timestamp: new Date().toISOString(),
                transactionId: editLoan.transactionId
            }));
            setEditLoan({
                transactionId: 0,
                statusPengembalian: RETURN_STATUS[0],
                catatan: "",
            });
            setShowEditForm(false);
            setEditNotification({ show: true, message: successMessage, isSuccess: true });
            fetchLoanList();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mengedit pengembalian";
            console.log("Edit error:", errorMessage);
            localStorage.setItem("lastEditMessage", JSON.stringify({
                message: errorMessage,
                timestamp: new Date().toISOString(),
                transactionId: editLoan.transactionId
            }));
            setEditNotification({ show: true, message: errorMessage, isSuccess: false });
        } finally {
            setFormLoading(false);
        }
    };

    const handleShowEditForm = (loan: BookLoan) => {
        if (loan.status.toLowerCase() === "dipinjam") {
            setEditLoan({
                transactionId: loan.id,
                statusPengembalian: loan.statusPengembalian || RETURN_STATUS[0],
                catatan: loan.statusPengembalian === "HILANG" || loan.statusPengembalian === "RUSAK" ? "Buku dalam kondisi tidak baik" : "",
            });
            setShowEditForm(true);
            setShowAddForm(false);
            setErrors({});
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Plus className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-extrabold text-gray-900">Manajemen Peminjaman & Pengembalian</h1>
                </div>
                <button
                    aria-label="Tambah Peminjaman Baru"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <Plus className="w-4 h-4" /> {showAddForm ? "Tutup" : "Tambah Peminjaman"}
                </button>
            </div>

            {addNotification.show && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${addNotification.isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white transition-all duration-300`}>
                    {addNotification.message}
                </div>
            )}

            {editNotification.show && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${editNotification.isSuccess ? 'bg-blue-500' : 'bg-orange-500'} text-white transition-all duration-300`}>
                    {editNotification.message}
                </div>
            )}

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 transform transition-all duration-300">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-700">
                        <Plus className="w-5 h-5" /> Tambah Peminjaman Baru
                    </h2>
                    <form onSubmit={handleAddLoan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Siswa</label>
                            <input
                                type="text"
                                name="siswaId"
                                value={newLoan.siswaId}
                                onChange={handleInputChange}
                                className={`w-full p-3 border ${errors.siswaId ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition`}
                                min="1"
                                required
                            />
                            {errors.siswaId && <p className="text-red-500 text-sm mt-1">{errors.siswaId}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Buku</label>
                            <input
                                type="number"
                                name="bukuId"
                                value={newLoan.bukuId}
                                onChange={handleInputChange}
                                className={`w-full p-3 border ${errors.bukuId ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition`}
                                min="1"
                                required
                            />
                            {errors.bukuId && <p className="text-red-500 text-sm mt-1">{errors.bukuId}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                            <input
                                type="date"
                                name="tanggalPinjam"
                                value={newLoan.tanggalPinjam}
                                onChange={handleInputChange}
                                className={`w-full p-3 border ${errors.tanggalPinjam ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition`}
                                required
                            />
                            {errors.tanggalPinjam && <p className="text-red-500 text-sm mt-1">{errors.tanggalPinjam}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jatuh Tempo</label>
                            <input
                                type="date"
                                name="tanggalJatuhTempo"
                                value={newLoan.tanggalJatuhTempo}
                                onChange={handleInputChange}
                                className={`w-full p-3 border ${errors.tanggalJatuhTempo ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition`}
                                required
                            />
                            {errors.tanggalJatuhTempo && <p className="text-red-500 text-sm mt-1">{errors.tanggalJatuhTempo}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={formLoading}
                                className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105 ${formLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <Save className="w-4 h-4" /> {formLoading ? "Memproses..." : "Simpan"}
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

            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-amber-700">
                            <Edit className="w-5 h-5" /> Edit Pengembalian
                        </h2>
                        <form onSubmit={handleEditLoan} className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Transaksi</label>
                                <input
                                    type="number"
                                    name="transactionId"
                                    value={editLoan.transactionId}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pengembalian</label>
                                <select
                                    name="statusPengembalian"
                                    value={editLoan.statusPengembalian}
                                    onChange={handleEditInputChange}
                                    className={`w-full p-3 border ${errors.statusPengembalian ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition`}
                                    required
                                >
                                    <option value="" disabled>Pilih Status</option>
                                    {RETURN_STATUS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                {errors.statusPengembalian && <p className="text-red-500 text-sm mt-1">{errors.statusPengembalian}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                <input
                                    type="text"
                                    name="catatan"
                                    value={editLoan.catatan || ""}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
                                    placeholder="Masukkan catatan jika ada"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className={`bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105 ${formLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <Save className="w-4 h-4" /> {formLoading ? "Memproses..." : "Update"}
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setErrors({});
                                    }}
                                >
                                    <X className="w-4 h-4" /> Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                    <p className="mt-2 font-medium">Memuat data peminjaman...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">No</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Judul Buku</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status Pengembalian</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tanggal Pinjam</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tanggal Jatuh Tempo</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tanggal Kembali</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPeminjaman.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Tidak ada data peminjaman ditemukan
                                    </td>
                                </tr>
                            ) : (
                                dataPeminjaman.map((loan: BookLoan, index: number) => (
                                    <tr
                                        key={loan.id}
                                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition-all duration-200 transform hover:shadow-md`}
                                    >
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{index + 1}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.namaSiswa}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.judulBuku}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.status}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.statusPengembalian || "-"}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.tanggalPinjam}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.tanggalJatuhTempo}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">{loan.tanggalKembali || "-"}</td>
                                        <td className="whitespace-nowrap text-sm text-gray-900 px-6 py-4 font-medium">
                                            <button
                                                className={`flex items-center gap-1 bg-amber-500 rounded-lg p-2 text-white ${loan.status.toLowerCase() !== "dipinjam" ? "opacity-50 cursor-not-allowed bg-gray-400" : "hover:bg-amber-600"} transition-colors duration-200`}
                                                onClick={() => handleShowEditForm(loan)}
                                                disabled={loan.status.toLowerCase() !== "dipinjam"}
                                                title={loan.status.toLowerCase() !== "dipinjam" ? "Hanya peminjaman dengan status 'dipinjam' yang dapat diedit" : "Edit Pengembalian"}
                                            >
                                                <Edit className="w-4 h-4" /> Edit
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
    );
};

export default LoansBooksPustakawan;