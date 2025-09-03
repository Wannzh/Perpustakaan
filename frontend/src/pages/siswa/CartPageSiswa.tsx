/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

interface CartItem {
    bookId: number;
    id: string;
    judul: string;
    coverImage?: string;
}

const CartPageSiswa: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [message, setMessage] = useState<string>("");
    const [showPopup, setShowPopup] = useState<boolean>(false);
    console.log(cart);

    const fetchCart = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            setMessage("Error: Token autentikasi tidak ditemukan");
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Gagal mengambil data keranjang - Status ${response.status}`);
            }

            const data: CartItem[] = await response.json();
            setCart(data);
        } catch (err: any) {
            console.error("Error:", err);
            setMessage(`Error: Gagal mengambil data keranjang - ${err.message}`);
            setShowPopup(true);
        }
    };

    const handleRemoveFromCart = async (bookId: number) => {
        const token = Cookies.get("authToken");
        if (!token) {
            setMessage("Error: Token autentikasi tidak ditemukan");
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/cart/remove/${bookId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal menghapus buku dari keranjang - Status ${response.status}`);
            }

            // Refetch cart to sync with backend state
            await fetchCart();
            setMessage("Buku berhasil dihapus dari keranjang!");
            setShowPopup(true);
        } catch (err: any) {
            console.error("Error:", err);
            setMessage(`Error: ${err.message}`);
            setShowPopup(true);
        }
    };

    const handleCheckout = async () => {
        const token = Cookies.get("authToken");
        if (!token) {
            setMessage("Error: Token autentikasi tidak ditemukan");
            setShowPopup(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/cart/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal melakukan checkout - Status ${response.status}`);
            }

            setCart([]);
            setMessage("Checkout berhasil! Peminjaman telah diproses.");
            setShowPopup(true);
        } catch (err: any) {
            console.error("Error:", err);
            setMessage(`Error: ${err.message}`);
            setShowPopup(true);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const closePopup = () => {
        setShowPopup(false);
        setMessage("");
    };

    return (
        <div className="container mx-auto px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans antialiased">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-5xl font-extrabold text-gray-900 animate-fade-in-down tracking-tight">
                    Keranjang Peminjaman
                </h1>
                <Link
                    to="/siswa/books-list"
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-8 rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-2xl focus:ring-4 focus:ring-indigo-300 transform hover:-translate-y-1"
                >
                    Kembali ke Koleksi
                </Link>
            </div>

            {cart.length === 0 ? (
                <div className="text-center text-gray-500 text-xl font-medium animate-fade-in animate-pulse py-20">
                    Keranjang kosong, tambahkan buku dari koleksi!
                </div>
            ) : (
                <div className="space-y-6">
                    {cart.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                        >
                            <img
                                src={item.coverImage }
                                alt={item.judul}
                                className="w-24 h-32 object-cover rounded-lg shadow-md"
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                                    {item.judul}
                                </h3>
                            </div>
                            <button
                                className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-6 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-4 focus:ring-red-300 transform hover:-translate-y-1"
                                onClick={() => handleRemoveFromCart(item.bookId)}
                            >
                                Hapus
                            </button>
                        </div>
                    ))}
                    <div className="sticky bottom-6 flex justify-end">
                        <button
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-10 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-2xl focus:ring-4 focus:ring-green-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                        >
                            <ShoppingCartIcon className="h-6 w-6 inline-block mr-2" />
                            Checkout
                        </button>
                    </div>
                </div>
            )}

            {showPopup && message && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={closePopup}
                >
                    <div
                        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {message.includes('Error') ? 'Operasi Gagal' : 'Operasi Berhasil'}
                            </h2>
                            <button
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 transform hover:scale-110"
                                onClick={closePopup}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <p className={`text-base ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                        <button
                            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 px-6 rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-300 transform hover:-translate-y-1"
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

export default CartPageSiswa;