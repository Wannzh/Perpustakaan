/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Plus, Save, X, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { parse, isBefore, isAfter, format } from "date-fns";
import { id } from "date-fns/locale";

interface PeminjamanRequestDTO {
    siswaId: number;
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

// Placeholder for ReturnStatusConstant; adjust based on actual backend enum
const RETURN_STATUS_OPTIONS = ["DIKEMBALIKAN", "TERLAMBAT"];

const LoansBooksPustakawan: React.FC = () => {
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [dataPeminjaman, setDataPeminjaman] = useState<BookLoan[]>([]);
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [newLoan, setNewLoan] = useState<PeminjamanRequestDTO>({
        siswaId: 0,
        bukuId: 0,
        tanggalPinjam: format(new Date(), "yyyy-MM-dd", { locale: id }),
        tanggalJatuhTempo: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd", { locale: id }),
    });
    const [editLoan, setEditLoan] = useState<{
        transactionId: number;
        statusPengembalian: string;
        catatan?: string;
        tanggalKembali?: string;
    }>({
        transactionId: 0,
        statusPengembalian: RETURN_STATUS_OPTIONS[0],
        catatan: "",
        tanggalKembali: "",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof PeminjamanRequestDTO | keyof PengembalianRequestDTO | "tanggalKembali", string>>>({});

    useEffect(() => {
        fetchLoanList();
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

    const fetchLoanList = async () => {
        try {
            const token = Cookies.get("authToken");
            if (!token) {
                setNotificationMessage("Token tidak ditemukan di cookie");
                setIsError(true);
                setShowNotification(true);
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
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
            setIsError(true);
            setShowNotification(true);
            setLoading(false);
        }
    };

    const validateAddForm = (): boolean => {
        const newErrors: Partial<Record<keyof PeminjamanRequestDTO, string>> = {};
        if (newLoan.siswaId <= 0) {
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
        const newErrors: Partial<Record<keyof PengembalianRequestDTO | "tanggalKembali", string>> = {};
        
        // Validasi ID Transaksi
        if (!editLoan.transactionId || editLoan.transactionId <= 0) {
            newErrors.transactionId = "ID Transaksi tidak valid";
        }

        // Validasi Status Pengembalian
        if (!editLoan.statusPengembalian) {
            newErrors.statusPengembalian = "Status Pengembalian wajib diisi";
        }

        // Validasi Tanggal Kembali
        const pinjamLoan = dataPeminjaman.find((loan) => loan.id === editLoan.transactionId);
        if (!editLoan.tanggalKembali) {
            newErrors.tanggalKembali = "Tanggal Kembali wajib diisi";
        } else {
            const tanggalKembali = parse(editLoan.tanggalKembali, "yyyy-MM-dd", new Date());
            const tanggalPinjam = pinjamLoan?.tanggalPinjam
                ? parse(pinjamLoan.tanggalPinjam, "yyyy-MM-dd", new Date())
                : null;
            const today = new Date();

            console.log("Validation - tanggalKembali:", editLoan.tanggalKembali, "tanggalPinjam:", pinjamLoan?.tanggalPinjam);

            if (!tanggalPinjam) {
                newErrors.tanggalKembali = "Data peminjaman tidak ditemukan";
            } else if (isBefore(tanggalKembali, tanggalPinjam)) {
                newErrors.tanggalKembali = "Tanggal Kembali tidak boleh sebelum Tanggal Pinjam";
            } else if (isAfter(tanggalKembali, today)) {
                newErrors.tanggalKembali = "Tanggal Kembali tidak boleh di masa depan";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewLoan((prev) => ({
            ...prev,
            [name]: name === "siswaId" || name === "bukuId" ? parseInt(value) || 0 : value,
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
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
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
                siswaId: 0,
                bukuId: 0,
                tanggalPinjam: format(new Date(), "yyyy-MM-dd", { locale: id }),
                tanggalJatuhTempo: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd", { locale: id }),
            });
            setShowAddForm(false);
            setNotificationMessage("Peminjaman berhasil ditambahkan");
            setIsError(false);
            setShowNotification(true);
            fetchLoanList();
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menambah peminjaman");
            setIsError(true);
            setShowNotification(true);
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
            setNotificationMessage("Token tidak ditemukan di cookie");
            setIsError(true);
            setShowNotification(true);
            return;
        }

        setFormLoading(true);
        try {
            const { tanggalKembali, ...payload } = editLoan; // Exclude tanggalKembali from payload
            const response = await fetch(`${API_BASE_URL}/api/pengembalian/manual`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Gagal mengedit peminjaman - Status ${response.status}`);
            }

            await response.json();
            setEditLoan({
                transactionId: 0,
                statusPengembalian: RETURN_STATUS_OPTIONS[0],
                catatan: "",
                tanggalKembali: "",
            });
            setShowEditForm(false);
            setNotificationMessage("Peminjaman berhasil diperbarui");
            setIsError(false);
            setShowNotification(true);
            fetchLoanList();
        } catch (err) {
            setNotificationMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengedit peminjaman");
            setIsError(true);
            setShowNotification(true);
        } finally {
            setFormLoading(false);
        }
    };

    const handleShowEditForm = (loan: BookLoan) => {
        if (loan.status.toLowerCase() === "dipinjam") {
            setEditLoan({
                transactionId: loan.id,
                statusPengembalian: loan.statusPengembalian || RETURN_STATUS_OPTIONS[0],
                catatan: "",
                tanggalKembali: loan.tanggalKembali || format(new Date(), "yyyy-MM-dd", { locale: id }),
            });
            setShowEditForm(true);
            setShowAddForm(false);
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
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setShowEditForm(false);
                    }}
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
                            <input
                                type="hidden"
                                name="transactionId"
                                value={editLoan.transactionId}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pengembalian</label>
                                <select
                                    name="statusPengembalian"
                                    value={editLoan.statusPengembalian}
                                    onChange={handleEditInputChange}
                                    className={`w-full p-3 border ${errors.statusPengembalian ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition`}
                                    required
                                >
                                    {RETURN_STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                {errors.statusPengembalian && <p className="text-red-500 text-sm mt-1">{errors.statusPengembalian}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali</label>
                                <input
                                    type="date"
                                    name="tanggalKembali"
                                    value={editLoan.tanggalKembali || ""}
                                    onChange={handleEditInputChange}
                                    className={`w-full p-3 border ${errors.tanggalKembali ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition`}
                                    required
                                />
                                {errors.tanggalKembali && <p className="text-red-500 text-sm mt-1">{errors.tanggalKembali}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                <input
                                    type="text"
                                    name="catatan"
                                    value={editLoan.catatan || ""}
                                    onChange={handleEditInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition"
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
                                    onClick={() => setShowEditForm(false)}
                                >
                                    <X className="w-4 h-4" /> Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div
                        className={`bg-white p-6 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isError ? "border-l-4 border-red-600" : "border-l-4 border-green-600"}`}
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
                                dataPeminjaman.map((loan, index) => (
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
                                                className={`flex items-center gap-1 bg-amber-500 rounded-lg p-2 text-white ${
                                                    loan.status.toLowerCase() !== "dipinjam" ? "opacity-50 cursor-not-allowed bg-gray-400" : "hover:bg-amber-600"
                                                } transition-colors duration-200`}
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