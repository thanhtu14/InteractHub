import React from "react";

const SecurityTab: React.FC = () => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu hiện tại
                </label>
                <input
                    type="password"
                    className="mt-1 w-full px-4 py-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu mới
                </label>
                <input
                    type="password"
                    className="mt-1 w-full px-4 py-2 border rounded-lg"
                />
            </div>

            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Đổi mật khẩu
            </button>
        </div>
    );
};

export default SecurityTab;