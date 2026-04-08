import React from "react";

const PreferencesTab: React.FC = () => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Giao diện
                </label>
                <select className="mt-1 w-full px-4 py-2 border rounded-lg">
                    <option>Sáng</option>
                    <option>Tối</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Ngôn ngữ
                </label>
                <select className="mt-1 w-full px-4 py-2 border rounded-lg">
                    <option>Tiếng Việt</option>
                    <option>English</option>
                </select>
            </div>
        </div>
    );
};

export default PreferencesTab;