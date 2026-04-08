// import { useState } from 'react';
// import { Search, AlertCircle, Eye, CheckCircle, X, ExternalLink, Clock } from 'lucide-react';

// export function ReportsAdminPage() {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filterStatus, setFilterStatus] = useState('all');
//     const [filterType, setFilterType] = useState('all');

//     const reports = [
//         {
//             id: 1,
//             type: 'spam',
//             reportedBy: 'Nguyễn Văn A',
//             reportedUser: 'Lê Văn C',
//             reportedContent: 'Bài viết chứa nhiều link spam và quảng cáo',
//             contentType: 'post',
//             reason: 'Spam và quảng cáo',
//             description: 'Bài viết này chứa quá nhiều link affiliate và nội dung quảng cáo không phù hợp',
//             status: 'pending',
//             priority: 'high',
//             createdAt: '30 phút trước',
//             evidence: true,
//         },
//         {
//             id: 2,
//             type: 'harassment',
//             reportedBy: 'Trần Thị B',
//             reportedUser: 'Hoàng Văn E',
//             reportedContent: 'Bình luận xúc phạm và quấy rối',
//             contentType: 'comment',
//             reason: 'Quấy rối và xúc phạm',
//             description: 'Người dùng này liên tục để lại các bình luận xúc phạm dưới bài viết của tôi',
//             status: 'pending',
//             priority: 'high',
//             createdAt: '1 giờ trước',
//             evidence: true,
//         },
//         {
//             id: 3,
//             type: 'inappropriate',
//             reportedBy: 'Phạm Thị D',
//             reportedUser: 'Bùi Thị H',
//             reportedContent: 'Hình ảnh không phù hợp',
//             contentType: 'post',
//             reason: 'Nội dung không phù hợp',
//             description: 'Bài viết chứa hình ảnh và nội dung không phù hợp với cộng đồng',
//             status: 'resolved',
//             priority: 'medium',
//             createdAt: '3 giờ trước',
//             evidence: false,
//             resolution: 'Đã xóa bài viết và cảnh báo người dùng',
//         },
//         {
//             id: 4,
//             type: 'misinformation',
//             reportedBy: 'Vũ Thị F',
//             reportedUser: 'Đặng Văn G',
//             reportedContent: 'Thông tin sai sự thật về sức khỏe',
//             contentType: 'post',
//             reason: 'Thông tin sai lệch',
//             description: 'Bài viết đăng thông tin y tế sai sự thật có thể gây nguy hiểm',
//             status: 'pending',
//             priority: 'high',
//             createdAt: '2 giờ trước',
//             evidence: true,
//         },
//         {
//             id: 5,
//             type: 'copyright',
//             reportedBy: 'Hoàng Văn E',
//             reportedUser: 'Lê Văn C',
//             reportedContent: 'Sử dụng hình ảnh không có bản quyền',
//             contentType: 'post',
//             reason: 'Vi phạm bản quyền',
//             description: 'Bài viết sử dụng hình ảnh của tôi mà không xin phép',
//             status: 'investigating',
//             priority: 'medium',
//             createdAt: '5 giờ trước',
//             evidence: true,
//         },
//         {
//             id: 6,
//             type: 'spam',
//             reportedBy: 'Nguyễn Văn A',
//             reportedUser: 'Phạm Thị D',
//             reportedContent: 'Spam comments',
//             contentType: 'comment',
//             reason: 'Spam bình luận',
//             description: 'Người dùng spam cùng một bình luận nhiều lần',
//             status: 'resolved',
//             priority: 'low',
//             createdAt: '1 ngày trước',
//             evidence: false,
//             resolution: 'Đã xóa các bình luận spam',
//         },
//         {
//             id: 7,
//             type: 'hate_speech',
//             reportedBy: 'Trần Thị B',
//             reportedUser: 'Vũ Thị F',
//             reportedContent: 'Phát ngôn kích động thù hận',
//             contentType: 'post',
//             reason: 'Ngôn từ thù hận',
//             description: 'Bài viết chứa ngôn từ kích động thù hận đối với một nhóm người',
//             status: 'pending',
//             priority: 'high',
//             createdAt: '45 phút trước',
//             evidence: true,
//         },
//         {
//             id: 8,
//             type: 'other',
//             reportedBy: 'Lê Văn C',
//             reportedUser: 'Nguyễn Văn A',
//             reportedContent: 'Vi phạm khác',
//             contentType: 'post',
//             reason: 'Vi phạm quy tắc cộng đồng',
//             description: 'Nội dung không phù hợp với quy định của cộng đồng',
//             status: 'rejected',
//             priority: 'low',
//             createdAt: '2 ngày trước',
//             evidence: false,
//             resolution: 'Không tìm thấy vi phạm',
//         },
//     ];

//     const getStatusBadge = (status: string) => {
//         const styles = {
//             pending: 'bg-yellow-100 text-yellow-700',
//             investigating: 'bg-blue-100 text-blue-700',
//             resolved: 'bg-green-100 text-green-700',
//             rejected: 'bg-gray-100 text-gray-700',
//         };
//         const labels = {
//             pending: 'Chờ xử lý',
//             investigating: 'Đang điều tra',
//             resolved: 'Đã giải quyết',
//             rejected: 'Đã từ chối',
//         };
//         return (
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
//                 {labels[status as keyof typeof labels]}
//             </span>
//         );
//     };

//     const getPriorityBadge = (priority: string) => {
//         const styles = {
//             high: 'bg-red-100 text-red-700',
//             medium: 'bg-orange-100 text-orange-700',
//             low: 'bg-blue-100 text-blue-700',
//         };
//         const labels = {
//             high: 'Cao',
//             medium: 'Trung bình',
//             low: 'Thấp',
//         };
//         return (
//             <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
//                 {labels[priority as keyof typeof labels]}
//             </span>
//         );
//     };

//     const getTypeLabel = (type: string) => {
//         const labels: Record<string, string> = {
//             spam: 'Spam',
//             harassment: 'Quấy rối',
//             inappropriate: 'Nội dung xấu',
//             misinformation: 'Thông tin sai',
//             copyright: 'Bản quyền',
//             hate_speech: 'Ngôn từ thù hận',
//             other: 'Khác',
//         };
//         return labels[type] || type;
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Quản lý Reports</h2>
//                     <p className="text-gray-600 mt-1">Xử lý các báo cáo vi phạm từ người dùng</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
//                         Xuất báo cáo
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-lg border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                     <div className="flex flex-col gap-4">
//                         <div className="flex flex-col sm:flex-row gap-4">
//                             <div className="flex-1 relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Tìm kiếm reports..."
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                             </div>
//                             <select
//                                 value={filterType}
//                                 onChange={(e) => setFilterType(e.target.value)}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                                 <option value="all">Tất cả loại</option>
//                                 <option value="spam">Spam</option>
//                                 <option value="harassment">Quấy rối</option>
//                                 <option value="inappropriate">Nội dung xấu</option>
//                                 <option value="misinformation">Thông tin sai</option>
//                                 <option value="copyright">Bản quyền</option>
//                                 <option value="hate_speech">Ngôn từ thù hận</option>
//                             </select>
//                             <select
//                                 value={filterStatus}
//                                 onChange={(e) => setFilterStatus(e.target.value)}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                                 <option value="all">Tất cả trạng thái</option>
//                                 <option value="pending">Chờ xử lý</option>
//                                 <option value="investigating">Đang điều tra</option>
//                                 <option value="resolved">Đã giải quyết</option>
//                                 <option value="rejected">Đã từ chối</option>
//                             </select>
//                         </div>

//                         <div className="flex items-center gap-6">
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <span className="font-medium">Tổng:</span>
//                                 <span>{reports.length} reports</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <span className="font-medium">Chờ xử lý:</span>
//                                 <span className="text-yellow-600 font-semibold">{reports.filter(r => r.status === 'pending').length}</span>
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <span className="font-medium">Ưu tiên cao:</span>
//                                 <span className="text-red-600 font-semibold">{reports.filter(r => r.priority === 'high').length}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="divide-y divide-gray-200">
//                     {reports.map((report) => (
//                         <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
//                             <div className="flex gap-4">
//                                 <div className="flex-shrink-0">
//                                     <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                                         <AlertCircle className="w-6 h-6 text-red-600" />
//                                     </div>
//                                 </div>

//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-start justify-between gap-4 mb-3">
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-2 mb-2">
//                                                 <h3 className="font-semibold text-gray-900">{report.reportedContent}</h3>
//                                                 {report.evidence && (
//                                                     <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
//                                                         Có chứng cứ
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
//                                                 <span className="flex items-center gap-1">
//                                                     <Clock className="w-4 h-4" />
//                                                     {report.createdAt}
//                                                 </span>
//                                                 <span>•</span>
//                                                 <span>Loại: <strong>{getTypeLabel(report.type)}</strong></span>
//                                                 <span>•</span>
//                                                 <span>Người báo cáo: <strong>{report.reportedBy}</strong></span>
//                                                 <span>•</span>
//                                                 <span>Bị báo cáo: <strong className="text-red-600">{report.reportedUser}</strong></span>
//                                             </div>
//                                             <div className="flex items-center gap-2 mb-3">
//                                                 {getStatusBadge(report.status)}
//                                                 {getPriorityBadge(report.priority)}
//                                                 <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
//                                                     {report.contentType === 'post' ? 'Bài viết' : 'Bình luận'}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="bg-gray-50 rounded-lg p-3 mb-4">
//                                         <p className="text-sm font-medium text-gray-900 mb-1">Lý do báo cáo:</p>
//                                         <p className="text-sm text-gray-700 mb-2">{report.reason}</p>
//                                         <p className="text-sm text-gray-600">{report.description}</p>
//                                     </div>

//                                     {report.resolution && (
//                                         <div className="bg-green-50 rounded-lg p-3 mb-4">
//                                             <p className="text-sm font-medium text-green-900 mb-1">Kết quả xử lý:</p>
//                                             <p className="text-sm text-green-700">{report.resolution}</p>
//                                         </div>
//                                     )}

//                                     <div className="flex items-center justify-between">
//                                         <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
//                                             <ExternalLink className="w-4 h-4" />
//                                             Xem nội dung gốc
//                                         </button>

//                                         {report.status === 'pending' && (
//                                             <div className="flex items-center gap-2">
//                                                 <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                     <Eye className="w-4 h-4" />
//                                                     Điều tra
//                                                 </button>
//                                                 <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                     <CheckCircle className="w-4 h-4" />
//                                                     Xác nhận vi phạm
//                                                 </button>
//                                                 <button className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                     <X className="w-4 h-4" />
//                                                     Từ chối
//                                                 </button>
//                                             </div>
//                                         )}

//                                         {report.status === 'investigating' && (
//                                             <div className="flex items-center gap-2">
//                                                 <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                     <CheckCircle className="w-4 h-4" />
//                                                     Giải quyết
//                                                 </button>
//                                                 <button className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-1">
//                                                     <X className="w-4 h-4" />
//                                                     Từ chối
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//                     <div className="text-sm text-gray-600">
//                         Hiển thị 1-{reports.length} trong tổng số {reports.length} reports
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
// export default ReportsAdminPage;

import React, { useState, useMemo } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ReportCard from '../../components/admin/ReportCard';
import ReportFilters from '../../components/admin/ReportFilters';

interface Report {
    id: number;
    type: string;
    reportedBy: string;
    reportedUser: string;
    reportedContent: string;
    contentType: string;
    reason: string;
    description: string;
    status: string;
    createdAt: string;
    evidence: boolean;
    resolution?: string;
}

const ReportsAdminPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const initialReports: Report[] = [
        {
            id: 1,
            type: 'spam',
            reportedBy: 'Nguyễn Văn A',
            reportedUser: 'Lê Văn C',
            reportedContent: 'Bài viết chứa nhiều link spam và quảng cáo',
            contentType: 'post',
            reason: 'Spam và quảng cáo',
            description: 'Bài viết này chứa quá nhiều link affiliate và nội dung quảng cáo không phù hợp',
            status: 'pending',
            createdAt: '30 phút trước',
            evidence: true,
        },
        {
            id: 2,
            type: 'harassment',
            reportedBy: 'Trần Thị B',
            reportedUser: 'Hoàng Văn E',
            reportedContent: 'Bình luận xúc phạm và quấy rối',
            contentType: 'comment',
            reason: 'Quấy rối và xúc phạm',
            description: 'Người dùng này liên tục để lại các bình luận xúc phạm dưới bài viết của tôi',
            status: 'pending',
            createdAt: '1 giờ trước',
            evidence: true,
        },
        {
            id: 3,
            type: 'inappropriate',
            reportedBy: 'Phạm Thị D',
            reportedUser: 'Bùi Thị H',
            reportedContent: 'Hình ảnh không phù hợp',
            contentType: 'post',
            reason: 'Nội dung không phù hợp',
            description: 'Bài viết chứa hình ảnh và nội dung không phù hợp với cộng đồng',
            status: 'resolved',
            createdAt: '3 giờ trước',
            evidence: false,
            resolution: 'Đã xóa bài viết và cảnh báo người dùng',
        },
        {
            id: 4,
            type: 'misinformation',
            reportedBy: 'Vũ Thị F',
            reportedUser: 'Đặng Văn G',
            reportedContent: 'Thông tin sai sự thật về sức khỏe',
            contentType: 'post',
            reason: 'Thông tin sai lệch',
            description: 'Bài viết đăng thông tin y tế sai sự thật có thể gây nguy hiểm',
            status: 'pending',
            createdAt: '2 giờ trước',
            evidence: true,
        },
        {
            id: 5,
            type: 'copyright',
            reportedBy: 'Hoàng Văn E',
            reportedUser: 'Lê Văn C',
            reportedContent: 'Sử dụng hình ảnh không có bản quyền',
            contentType: 'post',
            reason: 'Vi phạm bản quyền',
            description: 'Bài viết sử dụng hình ảnh của tôi mà không xin phép',
            status: 'investigating',
            createdAt: '5 giờ trước',
            evidence: true,
        },
        {
            id: 6,
            type: 'spam',
            reportedBy: 'Nguyễn Văn A',
            reportedUser: 'Phạm Thị D',
            reportedContent: 'Spam comments',
            contentType: 'comment',
            reason: 'Spam bình luận',
            description: 'Người dùng spam cùng một bình luận nhiều lần',
            status: 'resolved',
            createdAt: '1 ngày trước',
            evidence: false,
            resolution: 'Đã xóa các bình luận spam',
        },
        {
            id: 7,
            type: 'hate_speech',
            reportedBy: 'Trần Thị B',
            reportedUser: 'Vũ Thị F',
            reportedContent: 'Phát ngôn kích động thù hận',
            contentType: 'post',
            reason: 'Ngôn từ thù hận',
            description: 'Bài viết chứa ngôn từ kích động thù hận đối với một nhóm người',
            status: 'pending',
            createdAt: '45 phút trước',
            evidence: true,
        },
        {
            id: 8,
            type: 'other',
            reportedBy: 'Lê Văn C',
            reportedUser: 'Nguyễn Văn A',
            reportedContent: 'Vi phạm khác',
            contentType: 'post',
            reason: 'Vi phạm quy tắc cộng đồng',
            description: 'Nội dung không phù hợp với quy định của cộng đồng',
            status: 'rejected',
            createdAt: '2 ngày trước',
            evidence: false,
            resolution: 'Không tìm thấy vi phạm',
        },
    ];

    const filteredReports = useMemo(() => {
        return initialReports.filter((report) => {
            const matchSearch =
                report.reportedContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.reportedUser.toLowerCase().includes(searchQuery.toLowerCase());

            const matchType = filterType === 'all' || report.type === filterType;
            const matchStatus = filterStatus === 'all' || report.status === filterStatus;

            return matchSearch && matchType && matchStatus;
        });
    }, [searchQuery, filterType, filterStatus]);

    const pendingCount = initialReports.filter(r => r.status === 'pending').length;

    const handleInvestigate = (id: number) => console.log('Điều tra report ID:', id);
    const handleResolve = (id: number) => console.log('Giải quyết report ID:', id);
    const handleReject = (id: number) => console.log('Từ chối report ID:', id);
    const handleViewOriginal = (id: number) => console.log('Xem nội dung gốc ID:', id);

    return (
        <div className="space-y-6">
            <Header />
            <div className="flex-1 ml-64">
                <Sidebar />
                <div className="p-16 p-6">

                    <div className="bg-white rounded-lg border border-gray-200">
                        <ReportFilters
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            filterType={filterType}
                            setFilterType={setFilterType}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            totalReports={initialReports.length}
                            pendingCount={pendingCount}
                        />

                        <div className="divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onInvestigate={handleInvestigate}
                                    onResolve={handleResolve}
                                    onReject={handleReject}
                                    onViewOriginal={handleViewOriginal}
                                />
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                            <div>
                                Hiển thị 1-{filteredReports.length} trong tổng số {initialReports.length} reports
                            </div>
                            <div className="flex items-center gap-2">
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

export default ReportsAdminPage;