import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { BookOpenIcon, CalendarIcon, XMarkIcon, TagIcon, MagnifyingGlassIcon, QueueListIcon } from "@heroicons/react/24/outline";

interface BookLoan {
    id: number;
    idSiswa: string;
    judulBuku: string;
    namaSiswa: string;
    status: string;
    statusPengembalian: string;
    tanggalPinjam: string;
    tanggalKembali: string;
    denda: number;
}

interface UserLogin {
    id?: number;
    name?: string;
    email?: string;
}

const LoansBooksSiswa: React.FC = () => {
    const [dataBoks, setDataBoks] = useState<BookLoan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<BookLoan[]>([]);
    const [userLogin, setUserLogin] = useState<UserLogin>({});
    const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null);
    const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
    const [catatan, setCatatan] = useState<string>("");
    const [statusPengembalian, setStatusPengembalian] = useState<string>("");
    const [isReturning, setIsReturning] = useState<boolean>(false);
    const [returnMessage, setReturnMessage] = useState<string>("");
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("tanggalPinjam-desc");

    console.log(filteredLoans);

    useEffect(() => {
        fetchSiswaLogin();
    }, []);

    useEffect(() => {
        if (userLogin.id) {
            fetchData();
        }
    }, [userLogin]);

    useEffect(() => {
        let result = [...dataBoks].filter((item) => item.idSiswa === String(userLogin.id));

        if (searchTerm) {
            result = result.filter(
                (loan) =>
                    loan.judulBuku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    loan.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortOption) {
            case "judulBuku-asc":
                result.sort((a, b) => a.judulBuku.localeCompare(b.judulBuku));
                break;
            case "judulBuku-desc":
                result.sort((a, b) => b.judulBuku.localeCompare(a.judulBuku));
                break;
            case "tanggalPinjam-asc":
                result.sort((a, b) => new Date(a.tanggalPinjam).getTime() - new Date(b.tanggalPinjam).getTime());
                break;
            case "tanggalPinjam-desc":
                result.sort((a, b) => new Date(b.tanggalPinjam).getTime() - new Date(a.tanggalPinjam).getTime());
                break;
            case "tanggalKembali-asc":
                result.sort((a, b) => new Date(a.tanggalKembali).getTime() - new Date(b.tanggalKembali).getTime());
                break;
            case "tanggalKembali-desc":
                result.sort((a, b) => new Date(b.tanggalKembali).getTime() - new Date(a.tanggalKembali).getTime());
                break;
            default:
                break;
        }

        setFilteredLoans(result);
    }, [searchTerm, sortOption, dataBoks, userLogin.id]);

    const fetchSiswaLogin = () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const data = JSON.parse(user);
                setUserLogin(data);
            } else {
                setReturnMessage("Error: Data pengguna tidak ditemukan");
                setShowPopup(true);
            }
        } catch (err) {
            console.error("Error parsing user data:", err);
            setReturnMessage("Error: Gagal memuat data pengguna");
            setShowPopup(true);
        }
    };

    const [tamp, setTamp] = useState(0);
    const   fetchData = async () => {
        try {
            const token = Cookies.get("authToken");
            if (!token) {
                setReturnMessage("Error: Token autentikasi tidak ditemukan");
                setShowPopup(true);
                return;
            }

            const response = await fetch(
                "http://localhost:8080/api/peminjaman/manual/all?page=0&size=100&sortBy=tanggalPinjam&direction=desc",
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Gagal mengambil data peminjaman - Status ${response.status}`);
            }

            const data = await response.json();
            setDataBoks(data.content || []);
            setTamp(data);
        } catch (err) {
            console.error("Error fetching data peminjaman:", err);
            setReturnMessage(`Error: Gagal mengambil data peminjaman - ${err}`);
            setShowPopup(true);
        }
    };

    console.log(tamp);

    const handleReturnBook = async () => {
        if (!selectedLoan || !statusPengembalian) {
            setReturnMessage("Error: Harap pilih status pengembalian");
            setShowPopup(true);
            return;
        }

        setIsReturning(true);
        setReturnMessage("");

        const token = Cookies.get("authToken");
        if (!token) {
            setReturnMessage("Error: Token autentikasi tidak ditemukan");
            setIsReturning(false);
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/pengembalian/self", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    transactionId: selectedLoan.id,
                    statusPengembalian,
                    catatan: catatan || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal mengembalikan buku - Status ${response.status}`);
            }

            setReturnMessage("Buku berhasil dikembalikan!");
            setDataBoks((prev) => prev.filter((item) => item.id !== selectedLoan.id));
            setSelectedLoan(null);
            setShowReturnModal(false);
            setCatatan("");
            setStatusPengembalian("");
            setShowPopup(true);
        } catch (err) {
            setReturnMessage(`Error: ${err}`);
            setShowPopup(true);
        } finally {
            setIsReturning(false);
        }
    };

    const openDetailModal = (loan: BookLoan) => {
        setSelectedLoan(loan);
        setCatatan("");
        setStatusPengembalian("");
        setReturnMessage("");
    };

    const closeDetailModal = () => {
        setSelectedLoan(null);
        setCatatan("");
        setStatusPengembalian("");
        setReturnMessage("");
    };

    const openReturnModal = () => {
        setShowReturnModal(true);
    };

    const closeReturnModal = () => {
        setShowReturnModal(false);
        setCatatan("");
        setStatusPengembalian("");
    };

    const closePopup = () => {
        setShowPopup(false);
        setReturnMessage("");
        fetchData();
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans antialiased">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center animate-fade-in-down">
                Daftar Peminjaman Buku
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan judul buku atau nama peminjam..."
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <QueueListIcon className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 transform -translate-y-1/2" />
                    <select
                        className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-white border-gray-200 rounded-xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="judulBuku-asc">Judul Buku (A-Z)</option>
                        <option value="judulBuku-desc">Judul Buku (Z-A)</option>
                        <option value="tanggalPinjam-desc">Tanggal Pinjam (Terbaru)</option>
                        <option value="tanggalPinjam-asc">Tanggal Pinjam (Terlama)</option>
                        <option value="tanggalKembali-desc">Tanggal Kembali (Terbaru)</option>
                        <option value="tanggalKembali-asc">Tanggal Kembali (Terlama)</option>
                    </select>
                </div>
            </div>

            {filteredLoans.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium animate-fade-in">
                    Tidak ada data peminjaman.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLoans.map((item, index) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                                        {item.judulBuku}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Nama Peminjam:</span>
                                            <span className="ml-1">{item.namaSiswa}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <TagIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Status Peminjaman:</span>
                                            <span className="ml-1">{item.status}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <TagIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Status Pengembalian:</span>
                                            <span className="ml-1">{item.statusPengembalian || "Belum dikembalikan"}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Tanggal Pinjam:</span>
                                            <span className="ml-1">{new Date(item.tanggalPinjam).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                            <span className="font-medium">Tanggal Kembali:</span>
                                            <span className="ml-1">{new Date(item.tanggalKembali).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {item.status === "DIKEMBALIKAN" ? (
                                    <div className="mt-4 sm:mt-0 text-green-600 font-semibold">
                                        Buku Telah Dikembalikan
                                    </div>
                                ) : (
                                    <button
                                        className="mt-4 sm:mt-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 sm:ml-6 shadow-sm"
                                        onClick={() => openDetailModal(item)}
                                    >
                                        Lihat Detail
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedLoan && !showReturnModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={closeDetailModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Detail Peminjaman: {selectedLoan.judulBuku}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closeDetailModal}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Nama Peminjam:</span>
                                <span className="ml-1">{selectedLoan.namaSiswa}</span>
                            </div>
                            <div className="flex items-center">
                                <TagIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Status Peminjaman:</span>
                                <span className="ml-1">{selectedLoan.status}</span>
                            </div>
                            <div className="flex items-center">
                                <TagIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Status Pengembalian:</span>
                                <span className="ml-1">{selectedLoan.statusPengembalian || "Belum dikembalikan"}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Tanggal Pinjam:</span>
                                <span className="ml-1">{new Date(selectedLoan.tanggalPinjam).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Tanggal Kembali:</span>
                                <span className="ml-1">{new Date(selectedLoan.tanggalKembali).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-sm"
                                onClick={openReturnModal}
                            >
                                Kembalikan Buku
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedLoan && showReturnModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={closeReturnModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Kembalikan Buku: {selectedLoan.judulBuku}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closeReturnModal}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Nama Peminjam:</span>
                                <span className="ml-1">{selectedLoan.namaSiswa}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Tanggal Pinjam:</span>
                                <span className="ml-1">{new Date(selectedLoan.tanggalPinjam).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                <span className="font-medium">Tanggal Kembali:</span>
                                <span className="ml-1">{new Date(selectedLoan.tanggalKembali).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Pengembalian:
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                    value={statusPengembalian}
                                    onChange={(e) => setStatusPengembalian(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Pilih status pengembalian</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="RUSAK">Rusak</option>
                                    <option value="HILANG">Hilang</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan (Opsional):
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                    rows={4}
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Masukkan catatan jika ada..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button
                                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-6 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                                onClick={closeReturnModal}
                            >
                                Batal
                            </button>
                            <button
                                className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-sm ${isReturning ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={handleReturnBook}
                                disabled={isReturning}
                            >
                                {isReturning ? "Memproses..." : "Kembalikan Buku"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPopup && returnMessage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={closePopup}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {returnMessage.includes("Error") ? "Pengembalian Gagal" : "Pengembalian Berhasil"}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closePopup}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <p className={`text-sm ${returnMessage.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                            {returnMessage}
                        </p>
                        <button
                            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 shadow-sm"
                            onClick={closePopup}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansBooksSiswa;