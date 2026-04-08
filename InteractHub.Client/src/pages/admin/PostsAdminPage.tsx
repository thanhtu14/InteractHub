// import { useState } from 'react';
// import { Search, Filter, Eye, Heart, MessageSquare, Trash2, Flag, CheckCircle, X } from 'lucide-react';

// export function PostsAdminPage() {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filterType, setFilterType] = useState('all');

//     const posts = [
//         {
//             id: 1,
//             author: 'Nguyễn Văn A',
//             authorAvatar: 'A',
//             title: 'Tips học lập trình hiệu quả cho người mới bắt đầu',
//             content: 'Chia sẻ một số kinh nghiệm học lập trình hiệu quả từ kinh nghiệm bản thân...',
//             type: 'article',
//             views: 12543,
//             likes: 892,
//             comments: 156,
//             status: 'published',
//             createdAt: '2 giờ trước',
//             hasReports: false,
//         },
//         {
//             id: 2,
//             author: 'Trần Thị B',
//             authorAvatar: 'B',
//             title: 'Hướng dẫn React cho người mới',
//             content: 'React là một thư viện JavaScript phổ biến để xây dựng giao diện người dùng...',
//             type: 'tutorial',
//             views: 9821,
//             likes: 654,
//             comments: 98,
//             status: 'published',
//             createdAt: '5 giờ trước',
//             hasReports: false,
//         },
//         {
//             id: 3,
//             author: 'Lê Văn C',
//             authorAvatar: 'C',
//             title: 'Nội dung vi phạm chính sách',
//             content: 'Đây là một bài viết có nội dung không phù hợp...',
//             type: 'post',
//             views: 234,
//             likes: 12,
//             comments: 34,
//             status: 'flagged',
//             createdAt: '1 ngày trước',
//             hasReports: true,
//         },
//         {
//             id: 4,
//             author: 'Phạm Thị D',
//             authorAvatar: 'D',
//             title: 'Kinh nghiệm làm việc remote hiệu quả',
//             content: 'Làm việc từ xa đã trở thành xu hướng phổ biến, đây là những gì tôi học được...',
//             type: 'article',
//             views: 7654,
//             likes: 489,
//             comments: 67,
//             status: 'published',
//             createdAt: '3 giờ trước',
//             hasReports: false,
//         },
//         {
//             id: 5,
//             author: 'Hoàng Văn E',
//             authorAvatar: 'E',
//             title: 'Roadmap trở thành Developer chuyên nghiệp',
//             content: 'Bạn muốn trở thành developer? Đây là lộ trình chi tiết từ cơ bản đến nâng cao...',
//             type: 'guide',
//             views: 6892,
//             likes: 423,
//             comments: 89,
//             status: 'published',
//             createdAt: '6 giờ trước',
//             hasReports: false,
//         },
//         {
//             id: 6,
//             author: 'Vũ Thị F',
//             authorAvatar: 'F',
//             title: 'Cách tối ưu performance cho ứng dụng web',
//             content: 'Performance là yếu tố quan trọng trong phát triển web, dưới đây là các kỹ thuật...',
//             type: 'tutorial',
//             views: 8234,
//             likes: 521,
//             comments: 72,
//             status: 'published',
//             createdAt: '4 giờ trước',
//             hasReports: false,
//         },
//         {
//             id: 7,
//             author: 'Đặng Văn G',
//             authorAvatar: 'G',
//             title: 'Bài viết đang chờ duyệt',
//             content: 'Nội dung bài viết đang được kiểm duyệt bởi admin...',
//             type: 'post',
//             views: 45,
//             likes: 3,
//             comments: 1,
//             status: 'pending',
//             createdAt: '30 phút trước',
//             hasReports: false,
//         },
//         {
//             id: 8,
//             author: 'Bùi Thị H',
//             authorAvatar: 'H',
//             title: 'Spam content - nhiều link quảng cáo',
//             content: 'Click vào đây để nhận quà... Link quảng cáo spam...',
//             type: 'post',
//             views: 123,
//             likes: 5,
//             comments: 12,
//             status: 'flagged',
//             createdAt: '2 ngày trước',
//             hasReports: true,
//         },
//     ];

//     const getStatusBadge = (status: string) => {
//         const styles = {
//             published: 'bg-green-100 text-green-700',
//             pending: 'bg-yellow-100 text-yellow-700',
//             flagged: 'bg-red-100 text-red-700',
//             removed: 'bg-gray-100 text-gray-700',
//         };
//         const labels = {
//             published: 'Đã đăng',
//             pending: 'Chờ duyệt',
//             flagged: 'Vi phạm',
//             removed: 'Đã xóa',
//         };
//         return (
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
//                 {labels[status as keyof typeof labels]}
//             </span>
//         );
//     };

//     const getTypeBadge = (type: string) => {
//         const labels = {
//             article: 'Bài viết',
//             tutorial: 'Hướng dẫn',
//             guide: 'Chỉ dẫn',
//             post: 'Bài đăng',
//         };
//         return (
//             <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
//                 {labels[type as keyof typeof labels]}
//             </span>
//         );
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h2>
//                     <p className="text-gray-600 mt-1">Kiểm duyệt và quản lý nội dung bài viết</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
//                         Xuất báo cáo
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-lg border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                     <div className="flex flex-col sm:flex-row gap-4">
//                         <div className="flex-1 relative">
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Tìm kiếm bài viết..."
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                         </div>
//                         <select
//                             value={filterType}
//                             onChange={(e) => setFilterType(e.target.value)}
//                             className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         >
//                             <option value="all">Tất cả bài viết</option>
//                             <option value="published">Đã đăng</option>
//                             <option value="pending">Chờ duyệt</option>
//                             <option value="flagged">Vi phạm</option>
//                         </select>
//                     </div>

//                     <div className="flex items-center gap-6 mt-4">
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <span className="font-medium">Tổng:</span>
//                             <span>{posts.length} bài viết</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <span className="font-medium">Chờ duyệt:</span>
//                             <span className="text-yellow-600 font-semibold">{posts.filter(p => p.status === 'pending').length}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <span className="font-medium">Vi phạm:</span>
//                             <span className="text-red-600 font-semibold">{posts.filter(p => p.status === 'flagged').length}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="divide-y divide-gray-200">
//                     {posts.map((post) => (
//                         <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
//                             <div className="flex gap-4">
//                                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
//                                     {post.authorAvatar}
//                                 </div>

//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-start justify-between gap-4 mb-2">
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-2 mb-1">
//                                                 <h3 className="font-semibold text-gray-900">{post.title}</h3>
//                                                 {post.hasReports && (
//                                                     <Flag className="w-4 h-4 text-red-500" />
//                                                 )}
//                                             </div>
//                                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                                 <span>{post.author}</span>
//                                                 <span>•</span>
//                                                 <span>{post.createdAt}</span>
//                                                 <span>•</span>
//                                                 {getTypeBadge(post.type)}
//                                             </div>
//                                         </div>
//                                         {getStatusBadge(post.status)}
//                                     </div>

//                                     <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>

//                                     <div className="flex items-center justify-between">
//                                         <div className="flex items-center gap-6 text-sm text-gray-500">
//                                             <span className="flex items-center gap-1">
//                                                 <Eye className="w-4 h-4" />
//                                                 {post.views.toLocaleString()}
//                                             </span>
//                                             <span className="flex items-center gap-1">
//                                                 <Heart className="w-4 h-4" />
//                                                 {post.likes}
//                                             </span>
//                                             <span className="flex items-center gap-1">
//                                                 <MessageSquare className="w-4 h-4" />
//                                                 {post.comments}
//                                             </span>
//                                         </div>

//                                         <div className="flex items-center gap-2">
//                                             {post.status === 'pending' && (
//                                                 <>
//                                                     <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                         <CheckCircle className="w-4 h-4" />
//                                                         Phê duyệt
//                                                     </button>
//                                                     <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                         <X className="w-4 h-4" />
//                                                         Từ chối
//                                                     </button>
//                                                 </>
//                                             )}
//                                             {post.status === 'flagged' && (
//                                                 <>
//                                                     <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                         <CheckCircle className="w-4 h-4" />
//                                                         Khôi phục
//                                                     </button>
//                                                     <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                         <Trash2 className="w-4 h-4" />
//                                                         Xóa vĩnh viễn
//                                                     </button>
//                                                 </>
//                                             )}
//                                             <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1">
//                                                 <Eye className="w-4 h-4" />
//                                                 Chi tiết
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//                     <div className="text-sm text-gray-600">
//                         Hiển thị 1-{posts.length} trong tổng số {posts.length} bài viết
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
//                             Trước
//                         </button>
//                         <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
//                             1
//                         </button>
//                         <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
//                             2
//                         </button>
//                         <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
//                             Sau
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default PostsAdminPage;

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PostCard from '../../components/admin/PostCard';

// ==================== Interface ====================
interface Post {
    id: number;
    author: string;
    authorAvatar: string;
    title: string;
    content: string;
    type: 'article' | 'tutorial' | 'guide' | 'post';
    views: number;
    likes: number;
    comments: number;
    status: 'published' | 'pending' | 'flagged' | 'removed';
    createdAt: string;
    hasReports: boolean;
}

const PostsAdminPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'published' | 'pending' | 'flagged'>('all');

    // Dữ liệu bài viết (sau này sẽ lấy từ API)
    const initialPosts: Post[] = [
        // ... bạn dán toàn bộ 8 bài viết vào đây (giữ nguyên như code cũ)
        {
            id: 1,
            author: 'Nguyễn Văn A',
            authorAvatar: 'A',
            title: 'Tips học lập trình hiệu quả cho người mới bắt đầu',
            content: 'Chia sẻ một số kinh nghiệm học lập trình hiệu quả từ kinh nghiệm bản thân...',
            type: 'article',
            views: 12543,
            likes: 892,
            comments: 156,
            status: 'published',
            createdAt: '2 giờ trước',
            hasReports: false,
        },
        {
            id: 2,
            author: 'Nguyễn Thị A',
            authorAvatar: 'A',
            title: 'Tips học lập trình hiệu quả cho người mới bắt đầu',
            content: 'Chia sẻ một số kinh nghiệm học lập trình hiệu quả từ kinh nghiệm bản thân...',
            type: 'article',
            views: 12543,
            likes: 892,
            comments: 156,
            status: 'pending',
            createdAt: '2 giờ trước',
            hasReports: false,
        },
        {
            id: 3,
            author: 'Trần Thị B',
            authorAvatar: 'B',
            title: 'Hướng dẫn React cho người mới',
            content: 'React là một thư viện JavaScript phổ biến để xây dựng giao diện người dùng...',
            type: 'tutorial',
            views: 9821,
            likes: 654,
            comments: 98,
            status: 'published',
            createdAt: '5 giờ trước',
            hasReports: false,
        },
        {
            id: 4,
            author: 'Lê Văn C',
            authorAvatar: 'C',
            title: 'Nội dung vi phạm chính sách',
            content: 'Đây là một bài viết có nội dung không phù hợp...',
            type: 'post',
            views: 234,
            likes: 12,
            comments: 34,
            status: 'flagged',
            createdAt: '1 ngày trước',
            hasReports: true,
        },
        // ... (dán tiếp các bài còn lại để đủ 8 bài)
        // Tôi rút gọn ở đây để code không quá dài, bạn copy phần còn lại từ code gốc nhé
    ];

    // Logic lọc bài viết
    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const matchSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.author.toLowerCase().includes(searchQuery.toLowerCase());

            const matchFilter = filterType === 'all' || post.status === filterType;

            return matchSearch && matchFilter;
        });
    }, [searchQuery, filterType]);

    const pendingCount = initialPosts.filter(p => p.status === 'pending').length;
    const flaggedCount = initialPosts.filter(p => p.status === 'flagged').length;

    // Các hàm xử lý nút bấm
    const handleApprove = (id: number) => console.log('Phê duyệt:', id);
    const handleReject = (id: number) => console.log('Từ chối:', id);
    const handleRestore = (id: number) => console.log('Khôi phục:', id);
    const handleDelete = (id: number) => console.log('Xóa:', id);
    const handleViewDetail = (id: number) => console.log('Xem chi tiết:', id);

    return (
        <div className="space-y-6">
            <Header />
            <div className="flex-1 ml-64">
                <Sidebar />
                <div className="p-16 p-6">
                    <div className="bg-white rounded-lg border border-gray-200">
                        {/* Phần tìm kiếm + lọc */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm bài viết..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Tất cả bài viết</option>
                                    <option value="published">Đã đăng</option>
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="flagged">Vi phạm</option>
                                </select>
                            </div>

                            <div className="flex gap-6 mt-4 text-sm text-gray-600">
                                <div><span className="font-medium">Tổng:</span> {initialPosts.length} bài</div>
                                <div><span className="font-medium">Chờ duyệt:</span> <span className="text-yellow-600">{pendingCount}</span></div>
                                <div><span className="font-medium">Vi phạm:</span> <span className="text-red-600">{flaggedCount}</span></div>
                            </div>
                        </div>

                        {/* Danh sách bài viết - dùng component đã tách */}
                        <div className="divide-y divide-gray-200">
                            {filteredPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                    onViewDetail={handleViewDetail}
                                />
                            ))}
                        </div>

                        {/* Phần phân trang */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                            <div className="text-gray-600">
                                Hiển thị 1-{filteredPosts.length} trong tổng số {initialPosts.length} bài viết
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Trước</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostsAdminPage;