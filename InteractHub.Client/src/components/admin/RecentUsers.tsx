import React from "react";

// ==================== Interface ====================

interface RecentUser {
    name: string;
    action: string;
    time: string;
}

const RecentUsers: React.FC = () => {
    const users: RecentUser[] = [
        {
            name: "Nguyễn Văn A",
            action: "Đã đăng bài",
            time: "5 phút trước"
        },
        {
            name: "Trần Thị B",
            action: "Đã bình luận",
            time: "12 phút trước"
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Người dùng gần đây</h3>

            <div className="space-y-4">
                {users.map((user, index) => (
                    <div key={index} className="flex justify-between items-start">
                        <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.action}</p>
                        </div>
                        <small className="text-gray-500 whitespace-nowrap ml-4">
                            {user.time}
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentUsers;