import { useEffect, useState } from "react";
import { User, Mail, IdCard, Shield, School, User2 } from "lucide-react";

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
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = async () => {
        const data = localStorage.getItem('user');
        if (data) {
            const user = JSON.parse(data);
            setUser(user);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <User size={48} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h1>
                    <p className="text-gray-500 mb-6">{user.role}</p>
                    
                    <div className="w-full space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="text-blue-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-800">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <User2 className="text-blue-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Username</p>
                                <p className="text-gray-800">{user.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <IdCard className="text-blue-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">NIS</p>
                                <p className="text-gray-800">{user.nis}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <School className="text-blue-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Class</p>
                                <p className="text-gray-800">{user.userClass}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Shield className="text-blue-500" size={20} />
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="text-gray-800">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSiswa;