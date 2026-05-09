// import React, { useState, useMemo, useEffect } from 'react';
// import Header from '../../components/layout/Header';
// import Sidebar from '../../components/layout/Sidebar';
// import ReportCard from '../../components/admin/ReportCard';
// import ReportFilters from '../../components/admin/ReportFilters';
// import PostDetail from '../../components/admin/PostDetail';
// import { postService } from '../../services/postService';
// import ReportHandleModal from '../../components/admin/ReportHandleModal';


// interface Report {
//     id: number;
//     type: string;
//     reportedBy: string;
//     reportedUser: string;
//     reportedContent: string;
//     contentType: string;
//     reason: string;
//     description: string;
//     status: string;
//     createdAt: string;
//     resolvedAt: string;
//     adminNote: string;
//     evidence: boolean;
//     resolution?: string;

//     post: any;
// }

// interface CommentDTO {
//     Id: number;
//     Content: string;
//     UserId: string;
//     UserName: string;
//     UserAvatar?: string | null;
//     PostId: number;
//     ParentId?: number | null;
//     ParentUserName?: string | null;
//     Status?: number | null;
//     CreatedAt?: string | null;
//     LikeCount: number;
//     IsLikedByCurrentUser: boolean;
//     Replies: CommentDTO[];
// }
// interface Post {
//     id: string;
//     author: string;
//     authorAvatar: string;
//     title: string;
//     content: string;
//     countLike: number;
//     likes: { UserId: string; UserName: string; Avatar: string; Type?: string }[];
//     countComment: number;
//     comments: CommentDTO[];
//     status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
//     createdAt: string;
//     mediaUrls?: string[];
//     SharedPost?: Post | null;
// }

// const BASE_URL = "https://localhost:7069";


// const ReportsAdminPage: React.FC = () => {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filterStatus, setFilterStatus] = useState('all');
//     const [filterType, setFilterType] = useState('all');
//     const [reports, setReports] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [openModal, setOpenModal] = useState(false);
//     const [mode, setMode] = useState<'resolve' | 'reject' | null>(null);
//     const [selectedReport, setSelectedReport] = useState<Report | null>(null);

//     useEffect(() => {
//         const fetchReports = async () => {
//             try {
//                 setLoading(true);
//                 const data = await postService.getAllPostReportsAdmin();

//                 const normalizeType = (type: string) => {
//                     const t = (type || "").toLowerCase();

//                     if (t.includes("spam")) return "Spam";
//                     if (t.includes("bạo lực")) return "Bạo lực";
//                     if (t.includes("ngôn ngữ gây thù ghét")) return "Ngôn từ thù ghét";
//                     if (t.includes("ảnh khỏa thân")) return "Ảnh nhạy cảm";
//                     if (t.includes("quấy rối")) return "Quấy rối";
//                     if (t.includes("vấn đề khác")) return "Vấn đề khác";
//                     return "other";
//                 };

//                 // map BE → FE
//                 const mapped: Report[] = data.map((r: any) => ({
//                     id: r.Id,
//                     type: normalizeType(r.Type),
//                     reportedBy: r.UserName || "",
//                     reportedUser: r.Post?.AuthorName || "Unknown",
//                     reportedContent: r.Content || r.Post?.Content || "",
//                     contentType: 'post',
//                     reason: r.Type,
//                     description: r.Content,
//                     status:
//                         r.Status === 0 ? 'pending' :
//                             r.Status === 1 ? 'finished' : 'refuse',
//                     createdAt: r.CreatedAt
//                         ? new Date(r.CreatedAt).toLocaleString('vi-VN')
//                         : "",
//                     resolvedAt: r.ResolvedAt
//                         ? new Date(r.ResolvedAt).toLocaleString('vi-VN')
//                         : "",
//                     adminNote: r.AdminNote,
//                     evidence: false,
//                     post: r.Post
//                 }));

//                 setReports(mapped);
//             } catch (err) {
//                 console.error("Lỗi load report:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchReports();
//     }, []);

//     const filteredReports = useMemo(() => {
//         return reports.filter((report) => {
//             const matchSearch =
//                 (report.reportedContent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 (report.reportedBy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 (report.reportedUser || '').toLowerCase().includes(searchQuery.toLowerCase());

//             const matchType = filterType === 'all' || report.type === filterType;
//             const matchStatus = filterStatus === 'all' || report.status === filterStatus;

//             return matchSearch && matchType && matchStatus;
//         });
//     }, [reports, searchQuery, filterType, filterStatus]);

//     const pendingCount = reports.filter(r => r.status === 'pending').length;


//     const [selectedPost, setSelectedPost] = useState<Post | null>(null);

//     const mapComment = (c: CommentDTO): CommentDTO => ({
//         Id: c.Id,
//         Content: c.Content,
//         UserId: c.UserId,
//         UserName: c.UserName,
//         UserAvatar: c.UserAvatar,
//         PostId: c.PostId,
//         ParentId: c.ParentId,
//         ParentUserName: c.ParentUserName,
//         Status: c.Status,
//         CreatedAt: c.CreatedAt,
//         LikeCount: c.LikeCount,
//         IsLikedByCurrentUser: c.IsLikedByCurrentUser,

//         // 🔥 QUAN TRỌNG
//         Replies: (c.Replies || []).map(mapComment)
//     });

//     const handleOpenResolve = (id: number) => {
//         const r = reports.find(x => x.id === id);
//         if (!r) return;

//         setSelectedReport(r);
//         setMode('resolve');
//         setOpenModal(true);
//     };

//     const handleOpenReject = (id: number) => {
//         const r = reports.find(x => x.id === id);
//         if (!r) return;

//         setSelectedReport(r);
//         setMode('reject');
//         setOpenModal(true);
//     };

//     const handleViewPost = (id: number) => {
//         const report = reports.find(r => r.id === id);
//         if (!report || !report.post) return;

//         const p = report.post;

//         const mappedPost: Post = {
//             id: p.Id?.toString() || "",
//             author: p.AuthorName || "Ẩn danh",
//             authorAvatar: p.AuthorAvatar
//                 ? (p.AuthorAvatar.startsWith("http")
//                     ? p.AuthorAvatar
//                     : BASE_URL + p.AuthorAvatar)
//                 : "",
//             title: p.Title || "",
//             content: p.Content || "",
//             countLike: p.LikeCount || 0,

//             likes: (p.UserLike || []).map((like: any) => ({
//                 UserId: like.UserId,
//                 UserName: like.UserName,
//                 Avatar: like.Avatar,
//                 Type: like.Type
//             })),

//             countComment: p.CommentCount || 0,

//             // ✅ FIX CHUẨN
//             comments: (p.Comments || []).map(mapComment),

//             status:
//                 p.Status === -1
//                     ? 'delete'
//                     : p.Status === 0
//                         ? 'hidden'
//                         : p.Status === 1
//                             ? 'public'
//                             : p.Status === 2
//                                 ? 'friend'
//                                 : 'private',

//             createdAt: p.CreatedAt
//                 ? new Date(p.CreatedAt).toLocaleString('vi-VN')
//                 : "",

//             mediaUrls: p.MediaUrls?.map((url: string) =>
//                 url.startsWith("http") ? url : BASE_URL + url
//             ) || [],
//             SharedPost: p.SharedPost ? mapPost(p.SharedPost) : null

//         };

//         setSelectedPost(mappedPost);
//     };
//     const updateReportStatus = (
//         reportId: number,
//         action: 'hide' | 'delete' | 'reject',
//         message: string
//     ) => {
//         setReports(prev =>
//             prev.map(r => {
//                 if (r.id !== reportId) return r;

//                 return {
//                     ...r,
//                     status: action === 'reject' ? 'refuse' : 'finished',
//                     adminNote: message,
//                     resolvedAt: new Date().toLocaleString('vi-VN')
//                 };
//             })
//         );
//     };

//     return (
//         <div className="space-y-6">
//             <Header />
//             <div className="flex-1 ml-64">
//                 <Sidebar />
//                 <div className="p-16 p-6">

//                     <div className="bg-white rounded-lg border border-gray-200">
//                         <ReportFilters
//                             searchQuery={searchQuery}
//                             setSearchQuery={setSearchQuery}
//                             filterType={filterType}
//                             setFilterType={setFilterType}
//                             filterStatus={filterStatus}
//                             setFilterStatus={setFilterStatus}
//                             totalReports={reports.length}
//                             pendingCount={pendingCount}
//                         />

//                         <div className="divide-y divide-gray-200">
//                             {filteredReports.map((report) => (
//                                 <ReportCard
//                                     key={report.id}
//                                     report={report}
//                                     onInvestigate={handleOpenResolve}   //  mở modal resolve
//                                     onResolve={() => { }}                // không dùng
//                                     onReject={handleOpenReject}         //  mở modal reject
//                                     onViewOriginal={handleViewPost}
//                                 />
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {selectedPost && (
//                 <PostDetail
//                     post={selectedPost}
//                     onClose={() => setSelectedPost(null)}
//                 />
//             )}
//             {openModal && selectedReport && mode && (
//                 <ReportHandleModal
//                     report={selectedReport}
//                     mode={mode}
//                     onClose={() => setOpenModal(false)}
//                     onSubmit={(data) => {
//                         updateReportStatus(
//                             data.reportId,
//                             data.action,
//                             data.message
//                         );

//                         setOpenModal(false);
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default ReportsAdminPage;

import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ReportCard from '../../components/admin/ReportCard';
import ReportFilters from '../../components/admin/ReportFilters';
import PostDetail from '../../components/admin/PostDetail';
import { postService } from '../../services/postService';
import ReportHandleModal from '../../components/admin/ReportHandleModal';

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
    resolvedAt: string;
    adminNote: string;
    evidence: boolean;
    resolution?: string;
    post: any;
}

interface CommentDTO {
    Id: number;
    Content: string;
    UserId: string;
    UserName: string;
    UserAvatar?: string | null;
    PostId: number;
    ParentId?: number | null;
    ParentUserName?: string | null;
    Status?: number | null;
    CreatedAt?: string | null;
    LikeCount: number;
    IsLikedByCurrentUser: boolean;
    Replies: CommentDTO[];
}

interface PostResponse {
    Id: number;
    Title?: string;
    Content?: string;
    UserId?: string;
    Status?: number;
    AuthorName?: string;
    AuthorAvatar?: string;
    CreatedAt?: string;
    LikeCount?: number;
    UserLike?: { UserId: string; UserName: string; Avatar?: string; Type?: string }[];
    CommentCount?: number;
    Comments: CommentDTO[];
    SharedPost?: PostResponse | null;
    MediaUrls?: string[];
}

interface Post {
    id: string;
    author: string;
    authorAvatar: string;
    title: string;
    content: string;
    countLike: number;
    likes: { UserId: string; UserName: string; Avatar: string; Type?: string }[];
    countComment: number;
    comments: CommentDTO[];
    status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
    createdAt: string;
    mediaUrls?: string[];
    SharedPost?: Post | null;
}

const BASE_URL = "https://localhost:7069";

// ── Hàm dùng chung ───────────────────────────────────────────
const mapComment = (c: CommentDTO): CommentDTO => ({
    Id: c.Id,
    Content: c.Content,
    UserId: c.UserId,
    UserName: c.UserName,
    UserAvatar: c.UserAvatar,
    PostId: c.PostId,
    ParentId: c.ParentId,
    ParentUserName: c.ParentUserName,
    Status: c.Status,
    CreatedAt: c.CreatedAt,
    LikeCount: c.LikeCount,
    IsLikedByCurrentUser: c.IsLikedByCurrentUser,
    Replies: (c.Replies || []).map(mapComment),
});

const mapPost = (p: PostResponse): Post => ({
    id: p.Id?.toString() || "",
    author: p.AuthorName || "Ẩn danh",
    authorAvatar: p.AuthorAvatar
        ? (p.AuthorAvatar.startsWith("http")
            ? p.AuthorAvatar
            : BASE_URL + p.AuthorAvatar)
        : "",
    title: p.Title || "",
    content: p.Content || "",
    countLike: p.LikeCount || 0,
    likes: (p.UserLike || []).map((like) => ({
        UserId: like.UserId,
        UserName: like.UserName,
        Avatar: like.Avatar!,
        Type: like.Type,
    })),
    countComment: p.CommentCount || 0,
    comments: (p.Comments || []).map(mapComment),
    status:
        p.Status === -1 ? 'delete'
        : p.Status === 0 ? 'hidden'
        : p.Status === 1 ? 'public'
        : p.Status === 2 ? 'friend'
        : 'private',
    createdAt: p.CreatedAt
        ? new Date(p.CreatedAt).toLocaleString('vi-VN')
        : "",
    mediaUrls: p.MediaUrls?.map((url) =>
        url.startsWith("http") ? url : BASE_URL + url
    ) || [],
    SharedPost: p.SharedPost ? mapPost(p.SharedPost) : null,
});

// ─────────────────────────────────────────────────────────────

const ReportsAdminPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [reports, setReports] = useState<Report[]>([]);
    // const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [mode, setMode] = useState<'resolve' | 'reject' | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // setLoading(true);
                const data = await postService.getAllPostReportsAdmin();

                const normalizeType = (type: string) => {
                    const t = (type || "").toLowerCase();
                    if (t.includes("spam")) return "Spam";
                    if (t.includes("bạo lực")) return "Bạo lực";
                    if (t.includes("ngôn ngữ gây thù ghét")) return "Ngôn từ thù ghét";
                    if (t.includes("ảnh khỏa thân")) return "Ảnh nhạy cảm";
                    if (t.includes("quấy rối")) return "Quấy rối";
                    if (t.includes("vấn đề khác")) return "Vấn đề khác";
                    return "other";
                };

                const mapped: Report[] = data.map((r: any) => ({
                    id: r.Id,
                    type: normalizeType(r.Type),
                    reportedBy: r.UserName || "",
                    reportedUser: r.Post?.AuthorName || "Unknown",
                    reportedContent: r.Content || r.Post?.Content || "",
                    contentType: 'post',
                    reason: r.Type,
                    description: r.Content,
                    status:
                        r.Status === 0 ? 'pending' :
                        r.Status === 1 ? 'finished' : 'refuse',
                    createdAt: r.CreatedAt
                        ? new Date(r.CreatedAt).toLocaleString('vi-VN')
                        : "",
                    resolvedAt: r.ResolvedAt
                        ? new Date(r.ResolvedAt).toLocaleString('vi-VN')
                        : "",
                    adminNote: r.AdminNote,
                    evidence: false,
                    post: r.Post,
                }));

                setReports(mapped);
            } catch (err) {
                console.error("Lỗi load report:", err);
            } finally {
                // setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const matchSearch =
                (report.reportedContent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (report.reportedBy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (report.reportedUser || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchType = filterType === 'all' || report.type === filterType;
            const matchStatus = filterStatus === 'all' || report.status === filterStatus;
            return matchSearch && matchType && matchStatus;
        });
    }, [reports, searchQuery, filterType, filterStatus]);

    const pendingCount = reports.filter(r => r.status === 'pending').length;

    const handleOpenResolve = (id: number) => {
        const r = reports.find(x => x.id === id);
        if (!r) return;
        setSelectedReport(r);
        setMode('resolve');
        setOpenModal(true);
    };

    const handleOpenReject = (id: number) => {
        const r = reports.find(x => x.id === id);
        if (!r) return;
        setSelectedReport(r);
        setMode('reject');
        setOpenModal(true);
    };

    // ── Dùng mapPost giống PostsAdminPage ─────────────────────
    const handleViewPost = (id: number) => {
        const report = reports.find(r => r.id === id);
        if (!report || !report.post) return;
        setSelectedPost(mapPost(report.post as PostResponse));
    };

    const updateReportStatus = (
        reportId: number,
        action: 'hide' | 'delete' | 'reject',
        message: string
    ) => {
        setReports(prev =>
            prev.map(r => {
                if (r.id !== reportId) return r;
                return {
                    ...r,
                    status: action === 'reject' ? 'refuse' : 'finished',
                    adminNote: message,
                    resolvedAt: new Date().toLocaleString('vi-VN'),
                };
            })
        );
    };

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
                            totalReports={reports.length}
                            pendingCount={pendingCount}
                        />

                        <div className="divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onInvestigate={handleOpenResolve}
                                    onResolve={() => {}}
                                    onReject={handleOpenReject}
                                    onViewOriginal={handleViewPost}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedPost && (
                <PostDetail
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}

            {openModal && selectedReport && mode && (
                <ReportHandleModal
                    report={selectedReport}
                    mode={mode}
                    onClose={() => setOpenModal(false)}
                    onSubmit={(data) => {
                        updateReportStatus(data.reportId, data.action, data.message);
                        setOpenModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ReportsAdminPage;