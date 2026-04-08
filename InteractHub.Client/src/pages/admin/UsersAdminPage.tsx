import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import UserRow from '../../components/admin/UserRow';

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

const UsersAdminPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

    const initialUsers: User[] = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            avatar: 'A',
            status: 'active',
            posts: 45,
            followers: 1234,
            joinDate: '15/01/2024',
            lastActive: '2 giờ trước',
        },
        {
            id: 2,
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            avatar: 'B',
            status: 'active',
            posts: 32,
            followers: 892,
            joinDate: '20/01/2024',
            lastActive: '1 ngày trước',
        },
        {
            id: 3,
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            avatar: 'C',
            status: 'suspended',
            posts: 18,
            followers: 543,
            joinDate: '10/02/2024',
            lastActive: '5 ngày trước',
        },
        {
            id: 4,
            name: 'Phạm Thị D',
            email: 'phamthid@example.com',
            avatar: 'D',
            status: 'active',
            posts: 67,
            followers: 2156,
            joinDate: '05/01/2024',
            lastActive: '30 phút trước',
        },
        {
            id: 5,
            name: 'Hoàng Văn E',
            email: 'hoangvane@example.com',
            avatar: 'E',
            status: 'inactive',
            posts: 12,
            followers: 234,
            joinDate: '28/02/2024',
            lastActive: '15 ngày trước',
        },
        {
            id: 6,
            name: 'Vũ Thị F',
            email: 'vuthif@example.com',
            avatar: 'F',
            status: 'active',
            posts: 89,
            followers: 3421,
            joinDate: '12/12/2023',
            lastActive: '1 giờ trước',
        },
        {
            id: 7,
            name: 'Đặng Văn G',
            email: 'dangvang@example.com',
            avatar: 'G',
            status: 'active',
            posts: 54,
            followers: 1567,
            joinDate: '08/03/2024',
            lastActive: '3 giờ trước',
        },
        {
            id: 8,
            name: 'Bùi Thị H',
            email: 'buithih@example.com',
            avatar: 'H',
            status: 'suspended',
            posts: 23,
            followers: 421,
            joinDate: '19/02/2024',
            lastActive: '8 ngày trước',
        },
    ];

    const filteredUsers = useMemo(() => {
        return initialUsers.filter((user) => {
            const matchSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchFilter = filterStatus === 'all' || user.status === filterStatus;

            return matchSearch && matchFilter;
        });
    }, [searchQuery, filterStatus]);

    const activeCount = initialUsers.filter(u => u.status === 'active').length;
    const suspendedCount = initialUsers.filter(u => u.status === 'suspended').length;

    const handleViewDetail = (id: number) => console.log('Xem chi tiết user:', id);
    const handleSendEmail = (id: number) => console.log('Gửi email cho user:', id);
    const handleSuspend = (id: number) => console.log('Khóa user:', id);

    return (
        <div className="space-y-6">
            <Header />
            <div className="flex-1 ml-64">
                <Sidebar />
                <div className="p-16 p-6">
                    <div className="flex items-center justify-end px-4 py-3 gap-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Thêm người dùng
                        </button>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200">
                        {/* Phần tìm kiếm và lọc */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên hoặc email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Không hoạt động</option>
                                    <option value="suspended">Đã khóa</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                <div><span className="font-medium">Tổng:</span> {initialUsers.length} người dùng</div>
                                <div><span className="font-medium">Hoạt động:</span> {activeCount}</div>
                                <div><span className="font-medium">Đã khóa:</span> {suspendedCount}</div>
                            </div>
                        </div>

                        {/* Bảng người dùng */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài viết</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người theo dõi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoạt động cuối</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <UserRow
                                            key={user.id}
                                            user={user}
                                            onViewDetail={handleViewDetail}
                                            onSendEmail={handleSendEmail}
                                            onSuspend={handleSuspend}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Phần phân trang */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                            <div>Hiển thị 1-{filteredUsers.length} trong tổng số {initialUsers.length} người dùng</div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Trước</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersAdminPage;