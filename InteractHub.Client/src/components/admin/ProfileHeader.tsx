import React from 'react';
import { Camera, Mail, Calendar, Shield } from 'lucide-react';

const ProfileHeader: React.FC = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Ảnh bìa */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                <button className="absolute bottom-4 right-4 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    Đổi ảnh bìa
                </button>
            </div>

            {/* Avatar + Thông tin cơ bản */}
            <div className="px-6 pb-6">
                <div className="flex items-end gap-6 -mt-16 mb-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white">
                            A
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Camera className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex-1 pb-4">
                        <h3 className="text-2xl font-bold text-gray-900">Admin User</h3>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Shield className="w-4 h-4" />
                            Super Administrator
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                admin@example.com
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Tham gia ngày 01/01/2024
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;