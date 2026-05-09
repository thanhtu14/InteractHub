import React from 'react';
import { Eye, Ban, UserX } from 'lucide-react';

interface UserActions {
    userId: string;
    onViewDetail: (id: string) => void;
    //onSendEmail: (id: string) => void;
    onSuspend: (id: string) => void;
    onBan: (id: string) => void;
}

const UserActions: React.FC<UserActions> = ({
    userId,
    onViewDetail,
    //onSendEmail,
    onSuspend,
    onBan,
}) => {
    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => onViewDetail(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Xem chi tiết"
            >
                <Eye className="w-4 h-4 text-blue-600" />
            </button>
            {/* <button
                onClick={() => onSendEmail(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Gửi email"
            >
                <Mail className="w-4 h-4 text-blue-600" />
            </button> */}
            <button
                onClick={() => onSuspend(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Khóa tài khoản"
            >
                <UserX className="w-4 h-4 text-yellow-600" />
            </button>
            <button
                onClick={() => onBan(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cấm tài khoản"
            >
                <Ban className="w-4 h-4 text-red-600" />
            </button>
        </div>
    );
};

export default UserActions;