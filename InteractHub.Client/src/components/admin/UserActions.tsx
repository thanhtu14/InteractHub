import React from 'react';
import { Eye, Mail, Ban, MoreVertical } from 'lucide-react';

interface UserActions {
    userId: number;
    onViewDetail: (id: number) => void;
    onSendEmail: (id: number) => void;
    onSuspend: (id: number) => void;
}

const UserActions: React.FC<UserActions> = ({
    userId,
    onViewDetail,
    onSendEmail,
    onSuspend,
}) => {
    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => onViewDetail(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Xem chi tiết"
            >
                <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button
                onClick={() => onSendEmail(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Gửi email"
            >
                <Mail className="w-4 h-4 text-gray-600" />
            </button>
            <button
                onClick={() => onSuspend(userId)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Khóa tài khoản"
            >
                <Ban className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
        </div>
    );
};

export default UserActions;