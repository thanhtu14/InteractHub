import React from "react";

const ProfileInfoTab: React.FC = () => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Họ và tên
                </label>
                <input
                    type="text"
                    defaultValue="Admin User"
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    defaultValue="admin@example.com"
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Lưu thay đổi
            </button>
        </div>
    );
};

export default ProfileInfoTab;