import React from 'react';
import StatusBadge from './StatusBadge';
import UserActions from './UserActions';

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    status: 'active' | 'inactive' | 'suspended';
    posts: number;
    followers: number;
    joinDate: string;
    lastActive: string;
}

interface UserRow {
    user: User;
    onViewDetail: (id: number) => void;
    onSendEmail: (id: number) => void;
    onSuspend: (id: number) => void;
}

const UserRow: React.FC<UserRow> = ({ user, onViewDetail, onSendEmail, onSuspend }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.avatar}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={user.status} type="user" />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.posts}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.followers.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.joinDate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.lastActive}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <UserActions
                    userId={user.id}
                    onViewDetail={onViewDetail}
                    onSendEmail={onSendEmail}
                    onSuspend={onSuspend}
                />
            </td>
        </tr>
    );
};

export default UserRow;