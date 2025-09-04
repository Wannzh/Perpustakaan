/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  BookOpenIcon,
  CalendarIcon,
  XMarkIcon,
  TagIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { Star } from "lucide-react";

interface BookLoan {
  id: number;
  idSiswa: string;
  judulBuku: string;
  namaSiswa: string;
  status: string;
  statusPengembalian: string;
  tanggalPinjam: string;
  tanggalJatuhTempo: string; // tambah ini
  tanggalKembali: string;
  denda: number;
  rating: number;
}

interface UserLogin {
  id?: number;
  name?: string;
  email?: string;
  username?: string; // Added username field
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
  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [selectedLoanForRating, setSelectedLoanForRating] =
    useState<BookLoan | null>(null); // Changed to BookLoan
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  useEffect(() => {
    fetchSiswaLogin();
  }, []);

  console.log(filteredLoans);
  useEffect(() => {
    if (userLogin.id) {
      fetchData();
    }
  }, [userLogin]);

  useEffect(() => {
    let result = [...dataBoks].filter(
      (item) => item.idSiswa === String(userLogin.id)
    );

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
        result.sort((_a, b) => b.judulBuku.localeCompare(b.judulBuku));
        break;
      case "tanggalPinjam-asc":
        result.sort(
          (a, b) =>
            new Date(a.tanggalPinjam).getTime() -
            new Date(b.tanggalPinjam).getTime()
        );
        break;
      case "tanggalPinjam-desc":
        result.sort(
          (a, b) =>
            new Date(b.tanggalPinjam).getTime() -
            new Date(a.tanggalPinjam).getTime()
        );
        break;

        // Tambbah tanggal jatuh tempo
      case "tanggalJatuhTempo-asc":
        result.sort(
          (a, b) =>
            new Date(a.tanggalJatuhTempo).getTime() -
            new Date(b.tanggalJatuhTempo).getTime()
        );
        break;
      case "tanggalJatuhTempo-desc":
        result.sort(
          (a, b) =>
            new Date(b.tanggalJatuhTempo).getTime() -
            new Date(a.tanggalJatuhTempo).getTime()
        );
        break;
        // Sampai sini
        
      case "tanggalKembali-asc":
        result.sort(
          (a, b) =>
            new Date(a.tanggalJatuhTempo).getTime() -
            new Date(b.tanggalKembali).getTime()
        );
        break;
      case "tanggalKembali-desc":
        result.sort(
          (a, b) =>
            new Date(b.tanggalKembali).getTime() -
            new Date(a.tanggalKembali).getTime()
        );
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

  const [, setTamp] = useState<any>(0);
  const fetchData = async () => {
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
        throw new Error(
          `Gagal mengambil data peminjaman - Status ${response.status}`
        );
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
      const response = await fetch(
        "http://localhost:8080/api/pengembalian/self",
        {
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
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Gagal mengembalikan buku - Status ${response.status}`
        );
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

  const openRatingModal = (loan: BookLoan) => {
    setSelectedLoanForRating(loan);
    setRating(0);
    setHoverRating(0);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedLoanForRating(null);
    setRating(0);
    setHoverRating(0);
  };

  const handleRatingSubmit = async () => {
    if (!selectedLoanForRating || rating < 1 || rating > 5) {
      setReturnMessage("Error: Harap pilih rating antara 1 hingga 5 bintang");
      setShowPopup(true);
      return;
    }

    setIsSubmittingRating(true);

    const token = Cookies.get("authToken");
    if (!token) {
      setReturnMessage("Error: Token autentikasi tidak ditemukan");
      setIsSubmittingRating(false);
      setShowPopup(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/peminjaman/${selectedLoanForRating.id}/rating`,
        {
          method: "PATCH", // ← FIXED here
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // "X-Username": userLogin.username || "", // ❌ HAPUS: tidak perlu, backend ambil dari JWT
          },
          body: JSON.stringify({
            rating: rating,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Gagal memberikan rating - Status ${response.status}`
        );
      }

      setReturnMessage(`Rating ${rating} bintang berhasil diberikan!`);
      setShowPopup(true);
      closeRatingModal();
      fetchData(); // refresh data
    } catch (err) {
      setReturnMessage(`Error: ${err}`);
      setShowPopup(true);
    } finally {
      setIsSubmittingRating(false);
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
    <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans antialiased">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-16 text-center tracking-tight animate-fade-in-down">
        Daftar Peminjaman Buku
      </h1>

      <div className="flex flex-col sm:flex-row gap-6 mb-12 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-6 w-6 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul buku atau nama peminjam..."
            className="w-full pl-12 pr-6 py-4 text-base font-medium bg-white border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <QueueListIcon className="absolute left-4 top-1/2 h-6 w-6 text-gray-400 transform -translate-y-1/2" />
          <select
            className="w-full pl-12 pr-6 py-4 text-base font-medium bg-white border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-xl"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="judulBuku-asc">Judul Buku (A-Z)</option>
            <option value="judulBuku-desc">Judul Buku (Z-A)</option>
            <option value="tanggalPinjam-desc">Tanggal Pinjam (Terbaru)</option>
            <option value="tanggalPinjam-asc">Tanggal Pinjam (Terlama)</option>
            <option value="tanggalKembali-desc">
              Tanggal Kembali (Terbaru)
            </option>
            <option value="tanggalKembali-asc">
              Tanggal Kembali (Terlama)
            </option>
          </select>
        </div>
      </div>

      {filteredLoans.length === 0 ? (
        <div className="text-center text-gray-600 text-xl font-semibold animate-fade-in">
          Tidak ada data peminjaman.
        </div>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {filteredLoans.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight line-clamp-1">
                    {item.judulBuku}
                  </h3>
                  <div className="space-y-3 text-base text-gray-600">
                    <div className="flex items-center">
                      <BookOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="font-semibold">Nama Peminjam:</span>
                      <span className="ml-2">{item.namaSiswa}</span>
                    </div>
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="font-semibold">Status Peminjaman:</span>
                      <span className="ml-2">{item.status}</span>
                    </div>
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="font-semibold">
                        Status Pengembalian:
                      </span>
                      <span className="ml-2">
                        {item.statusPengembalian || "Belum dikembalikan"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="font-semibold">Tanggal Pinjam:</span>
                      <span className="ml-2">
                        {new Date(item.tanggalPinjam).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Tambbah Tanggal Jatuh Tempo */}
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-3 text-red-500" />
                      <span className="font-semibold">
                        Tanggal Jatuh Tempo:
                      </span>
                      <span className="ml-2">
                        {new Date(item.tanggalJatuhTempo).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-3 text-green-500" />
                      <span className="font-semibold">Tanggal Kembali:</span>
                      <span className="ml-2">
                        {item.tanggalKembali
                          ? new Date(item.tanggalKembali).toLocaleDateString()
                          : "Belum dikembalikan"}
                      </span>
                    </div>

                    {/* Sampai sini */}

                    
                  </div>
                </div>
                {item.status === "DIKEMBALIKAN" ? (
                  <div className="mt-6 sm:mt-0 flex items-center gap-4">
                    <span className="text-green-600 font-semibold text-base">
                      Buku Telah Dikembalikan
                    </span>
                    <button
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg transition-all duration-300 transform shadow-md
                                                ${
                                                  item.rating
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 hover:scale-105"
                                                }`}
                      onClick={() => openRatingModal(item)}
                      disabled={!!item.rating} // tombol akan disable jika rating sudah ada
                    >
                      <Star className="h-5 w-5" />
                      {item.rating
                        ? `Sudah Diberi Rating (${item.rating}⭐)`
                        : "Beri Rating"}
                    </button>
                  </div>
                ) : (
                  <button
                    className="mt-6 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md sm:ml-6"
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

      {/* Rating Modal */}
      {showRatingModal && selectedLoanForRating && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
          onClick={closeRatingModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-500 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                Beri Rating Buku
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                onClick={closeRatingModal}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                {selectedLoanForRating.judulBuku}
              </h3>
              <p className="text-base text-gray-500">
                Bagaimana pengalaman Anda dengan buku ini?
              </p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="transform transition-all duration-300 hover:scale-125 focus:outline-none"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      } transition-colors duration-200`}
                    />
                  </button>
                ))}
              </div>
            </div>
            {rating > 0 && (
              <div className="text-center mb-6">
                <p className="text-base text-gray-600">
                  Anda memberikan rating: <strong>{rating} bintang</strong>
                </p>
              </div>
            )}
            <div className="flex gap-4">
              <button
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-md"
                onClick={closeRatingModal}
                disabled={isSubmittingRating}
              >
                Batal
              </button>
              <button
                className={`flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-md ${
                  rating === 0 || isSubmittingRating
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleRatingSubmit}
                disabled={rating === 0 || isSubmittingRating}
              >
                {isSubmittingRating ? "Mengirim..." : "Kirim Rating"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLoan && !showReturnModal && !showRatingModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-500 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                Detail Peminjaman
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                onClick={closeDetailModal}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <div className="space-y-4 text-base text-gray-600">
              <div className="flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Nama Peminjam:</span>
                <span className="ml-2">{selectedLoan.namaSiswa}</span>
              </div>
              <div className="flex items-center">
                <TagIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Status Peminjaman:</span>
                <span className="ml-2">{selectedLoan.status}</span>
              </div>
              <div className="flex items-center">
                <TagIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Status Pengembalian:</span>
                <span className="ml-2">
                  {selectedLoan.statusPengembalian || "Belum dikembalikan"}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Tanggal Pinjam:</span>
                <span className="ml-2">
                  {new Date(selectedLoan.tanggalPinjam).toLocaleDateString()}
                </span>
              </div>

              {/* Tambah tanggal jatuh tempo */}
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Tanggal Jatuh Tempo:</span>
                <span className="ml-2">
                  {new Date(
                    selectedLoan.tanggalJatuhTempo
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Tanggal Kembali:</span>
                <span className="ml-2">
                  {/* Gunakan pengecekan: jika tanggal ada, format. Jika tidak, tampilkan teks. */}
                  {selectedLoan.tanggalKembali
                    ? new Date(selectedLoan.tanggalKembali).toLocaleDateString()
                    : "Belum dikembalikan"}
                </span>
              </div>
              {/* sampai sini */}

            </div>
            <div className="mt-8">
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md"
                onClick={openReturnModal}
              >
                Kembalikan Buku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {selectedLoan && showReturnModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
          onClick={closeReturnModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-500 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                Kembalikan Buku
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                onClick={closeReturnModal}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <div className="space-y-6 text-base text-gray-600">
              <div className="flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Nama Peminjam:</span>
                <span className="ml-2">{selectedLoan.namaSiswa}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Tanggal Pinjam:</span>
                <span className="ml-2">
                  {new Date(selectedLoan.tanggalPinjam).toLocaleDateString()}
                </span>
              </div>

              {/* Tambah Tanggal Jatuh Tempo */}
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Tanggal Jatuh Tempo:</span>
                <span className="ml-2">
                  {new Date(
                    selectedLoan.tanggalJatuhTempo
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3 text-blue-500" />
                <span className="font-semibold">Tanggal Kembali:</span>
                <span className="ml-2">
                  {/* Gunakan pengecekan yang sama di sini */}
                  {selectedLoan.tanggalKembali
                    ? new Date(selectedLoan.tanggalKembali).toLocaleDateString()
                    : "Belum dikembalikan"}
                </span>
              </div>
              {/* Sampai Sini */}
              
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Status Pengembalian:
                </label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-50"
                  value={statusPengembalian}
                  onChange={(e) => setStatusPengembalian(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Pilih status pengembalian
                  </option>
                  <option value="NORMAL">Normal</option>
                  <option value="RUSAK">Rusak</option>
                  <option value="HILANG">Hilang</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Catatan (Opsional):
                </label>
                <textarea
                  className="w-full p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-gray-50"
                  rows={4}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Masukkan catatan jika ada..."
                />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-md"
                onClick={closeReturnModal}
              >
                Batal
              </button>
              <button
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md ${
                  isReturning ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleReturnBook}
                disabled={isReturning}
              >
                {isReturning ? "Memproses..." : "Kembalikan Buku"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && returnMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-500 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                {returnMessage.includes("Error") ? "Gagal" : "Berhasil"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                onClick={closePopup}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <p
              className={`text-base ${
                returnMessage.includes("Error")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {returnMessage}
            </p>
            <button
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md"
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
