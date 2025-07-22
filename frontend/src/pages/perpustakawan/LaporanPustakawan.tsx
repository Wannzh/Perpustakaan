import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Download, Loader2 } from "lucide-react";
import { format, parse, isBefore } from "date-fns";
import { id } from "date-fns/locale";

interface BukuTerpopulerDTO {
    judulBuku: string;
    totalDipinjam: number;
}

interface SiswaTerlambatDTO {
    namaSiswa: string;
    totalTerlambat: number;
}

const API_BASE_URL = "http://localhost:8080";

const LaporanPustakawan: React.FC = () => {
    const [startDate, setStartDate] = useState<string>(
        format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd", { locale: id })
    );
    const [endDate, setEndDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd", { locale: id })
    );
    const [bukuTerpopuler, setBukuTerpopuler] = useState<BukuTerpopulerDTO[]>([]);
    const [siswaTerlambat, setSiswaTerlambat] = useState<SiswaTerlambatDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        isSuccess: boolean;
    }>({ show: false, message: "", isSuccess: true });
    const [errors, setErrors] = useState<{ startDate?: string; endDate?: string }>({});

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, message: "", isSuccess: true });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const validateDates = (): boolean => {
        const newErrors: { startDate?: string; endDate?: string } = {};
        if (!startDate) {
            newErrors.startDate = "Tanggal mulai wajib diisi";
        }
        if (!endDate) {
            newErrors.endDate = "Tanggal akhir wajib diisi";
        }
        if (startDate && endDate) {
            const start = parse(startDate, "yyyy-MM-dd", new Date());
            const end = parse(endDate, "yyyy-MM-dd", new Date());
            if (isBefore(end, start)) {
                newErrors.endDate = "Tanggal akhir harus setelah tanggal mulai";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchReports = async () => {
        if (!validateDates()) {
            setNotification({
                show: true,
                message: "Gagal memuat laporan: Periksa rentang tanggal.",
                isSuccess: false,
            });
            return;
        }

        const token = Cookies.get("authToken");
        if (!token) {
            setNotification({
                show: true,
                message: "Gagal memuat laporan: Token autentikasi tidak ditemukan.",
                isSuccess: false,
            });
            return;
        }

        setLoading(true);
        try {
            // Fetch buku terpopuler
            const bukuResponse = await fetch(
                `${API_BASE_URL}/api/laporan/buku-terpopuler?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!bukuResponse.ok) {
                const errorData = await bukuResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Gagal mengambil data buku terpopuler. Status: ${bukuResponse.status}`
                );
            }
            const bukuData = await bukuResponse.json();
            setBukuTerpopuler(bukuData);

            // Fetch siswa terlambat
            const siswaResponse = await fetch(
                `${API_BASE_URL}/api/laporan/siswa-terlambat?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!siswaResponse.ok) {
                const errorData = await siswaResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Gagal mengambil data siswa terlambat. Status: ${siswaResponse.status}`
                );
            }
            const siswaData = await siswaResponse.json();
            setSiswaTerlambat(siswaData);

            setNotification({
                show: true,
                message: "Laporan berhasil dimuat.",
                isSuccess: true,
            });
        } catch (err) {
            setNotification({
                show: true,
                message: err instanceof Error ? err.message : "Terjadi kesalahan saat memuat laporan.",
                isSuccess: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (type: "pdf" | "excel") => {
        if (!validateDates()) {
            setNotification({
                show: true,
                message: "Gagal mengunduh laporan: Periksa rentang tanggal.",
                isSuccess: false,
            });
            return;
        }

        const token = Cookies.get("authToken");
        if (!token) {
            setNotification({
                show: true,
                message: "Gagal mengunduh laporan: Token autentikasi tidak ditemukan.",
                isSuccess: false,
            });
            return;
        }

        setDownloadLoading(true);
        try {
            const endpoint =
                type === "pdf"
                    ? `${API_BASE_URL}/api/laporan/export/buku-terpopuler/pdf?startDate=${startDate}&endDate=${endDate}`
                    : `${API_BASE_URL}/api/laporan/export/siswa-terlambat/excel?startDate=${startDate}&endDate=${endDate}`;
            const filename = type === "pdf" ? "buku-terpopuler.pdf" : "siswa-terlambat.xlsx";

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Gagal mengunduh laporan ${type.toUpperCase()}. Status: ${response.status}`
                );
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setNotification({
                show: true,
                message: `Laporan ${type === "pdf" ? "Buku Terpopuler" : "Siswa Terlambat"} berhasil diunduh.`,
                isSuccess: true,
            });
        } catch (err) {
            setNotification({
                show: true,
                message: err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh laporan.",
                isSuccess: false,
            });
        } finally {
            setDownloadLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6m-6 2h6m4-14h-4m-6 0H5m4 14v4m0-4h6v4" />
                </svg>
                Laporan Perpustakaan
            </h1>

            {notification.show && (
                <div
                    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${notification.isSuccess ? "bg-green-500" : "bg-red-500"
                        } text-white transition-all duration-300`}
                >
                    {notification.message}
                    {!notification.isSuccess && (
                        <button
                            className="ml-2 text-white underline"
                            onClick={() => setNotification({ show: false, message: "", isSuccess: true })}
                        >
                            Tutup
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-2xl mb-8">
                <h2 className="text-xl font-semibold mb-6 text-indigo-700">Filter Laporan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setErrors((prev) => ({ ...prev, startDate: undefined }));
                            }}
                            className={`w-full p-3 border ${errors.startDate ? "border-red-500" : "border-gray-300"
                                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition`}
                        />
                        {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setErrors((prev) => ({ ...prev, endDate: undefined }));
                            }}
                            className={`w-full p-3 border ${errors.endDate ? "border-red-500" : "border-gray-300"
                                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition`}
                        />
                        {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReports}
                            disabled={loading}
                            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition-transform transform hover:scale-105 ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
                                </>
                            ) : (
                                "Tampilkan Laporan"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-2xl mb-8 overflow-hidden">
                <div className="flex justify-between items-center p-6">
                    <h2 className="text-xl font-semibold text-indigo-700">Buku Terpopuler</h2>
                    <button
                        onClick={() => handleDownload("pdf")}
                        disabled={downloadLoading || bukuTerpopuler.length === 0}
                        className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105 ${downloadLoading || bukuTerpopuler.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <Download className="w-4 h-4" /> Unduh PDF
                    </button>
                </div>
                {loading ? (
                    <div className="text-center text-gray-500 py-8">
                        <Loader2 className="animate-spin inline-block w-8 h-8 text-indigo-600" />
                        <p className="mt-2 font-medium">Memuat data laporan...</p>
                    </div>
                ) : (
                    <table className="min-w-full table-auto">
                        <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">No</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Judul Buku</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Jumlah Peminjaman</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bukuTerpopuler.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Tidak ada data buku terpopuler ditemukan
                                    </td>
                                </tr>
                            ) : (
                                bukuTerpopuler.map((buku, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition-all duration-200`}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{buku.judulBuku}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{buku.totalDipinjam}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6">
                    <h2 className="text-xl font-semibold text-indigo-700">Siswa Sering Terlambat</h2>
                    <button
                        onClick={() => handleDownload("excel")}
                        disabled={downloadLoading || siswaTerlambat.length === 0}
                        className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105 ${downloadLoading || siswaTerlambat.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <Download className="w-4 h-4" /> Unduh Excel
                    </button>
                </div>
                {loading ? (
                    <div className="text-center text-gray-500 py-8">
                        <Loader2 className="animate-spin inline-block w-8 h-8 text-indigo-600" />
                        <p className="mt-2 font-medium">Memuat data laporan...</p>
                    </div>
                ) : (
                    <table className="min-w-full table-auto">
                        <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">No</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Jumlah Keterlambatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {siswaTerlambat.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Tidak ada data siswa terlambat ditemukan
                                    </td>
                                </tr>
                            ) : (
                                siswaTerlambat.map((siswa, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition-all duration-200`}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{siswa.namaSiswa}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{siswa.totalTerlambat}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LaporanPustakawan;