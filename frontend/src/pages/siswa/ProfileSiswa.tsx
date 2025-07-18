import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { User, Mail, Shield, School, User2, LogOut, AlertCircle, CheckCircle, X } from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    username: string;
    nis: string;
    userClass: string;
}

const ProfileSiswa: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);

    const fetchUser = async () => {
        const data = localStorage.getItem('user');
        if (data) {
            const user = JSON.parse(data);
            setUser(user);
        } else {
            setNotificationMessage("Data pengguna tidak ditemukan");
            setIsError(true);
            setShowNotification(true);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (showNotification && !isError) {
            const timer = setTimeout(() => {
                setShowNotification(false);
                setNotificationMessage("");
                navigate("/");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showNotification, isError, navigate]);

    const handleLogout = () => {
        Cookies.remove("authToken");
        localStorage.removeItem("user");
        setNotificationMessage("Berhasil keluar");
        setIsError(false);
        setShowNotification(true);
        setShowLogoutModal(false);
        navigate("/");
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-gray-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-500 text-lg font-medium"
                >
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
                    Memuat...
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background Animation */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-300/30 to-purple-300/30"
                animate={{
                    background: [
                        "linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))",
                        "linear-gradient(90deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))",
                    ],
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-lg border border-white/30"
            >
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4"
                    >
                        <User size={48} className="text-indigo-600" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2"
                    >
                        {user.name}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-gray-500 mb-6 text-sm sm:text-base"
                    >
                        {user.role}
                    </motion.p>

                    <div className="w-full space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <Mail className="text-indigo-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-800 font-medium">{user.email}</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <User2 className="text-indigo-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Username</p>
                                <p className="text-gray-800 font-medium">{user.username}</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <User className="text-indigo-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">NIS</p>
                                <p className="text-gray-800 font-medium">{user.nis}</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <School className="text-indigo-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Kelas</p>
                                <p className="text-gray-800 font-medium">{user.userClass}</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <Shield className="text-indigo-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="text-gray-800 font-medium">{user.role}</p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                        onClick={() => setShowLogoutModal(true)}
                        className="mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:shadow-lg"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </motion.button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                    >
                        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border-l-4 border-red-600">
                            <div className="flex items-center gap-2 mb-4">
                                <LogOut className="w-5 h-5 text-red-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Konfirmasi Keluar</h2>
                            </div>
                            <p className="text-gray-700 mb-6">Apakah Anda yakin ingin keluar?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                >
                                    <LogOut className="w-4 h-4" /> Keluar
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                                >
                                    <X className="w-4 h-4" /> Batal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                    >
                        <div className={`bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border-l-4 ${isError ? 'border-red-600' : 'border-green-600'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                {isError ? (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                <h2 className="text-lg font-semibold text-gray-900">{isError ? "Error" : "Sukses"}</h2>
                            </div>
                            <p className="text-gray-700 mb-6">{notificationMessage}</p>
                            <button
                                onClick={() => setShowNotification(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-transform transform hover:scale-105 w-full justify-center"
                            >
                                <X className="w-4 h-4" /> Tutup
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileSiswa;