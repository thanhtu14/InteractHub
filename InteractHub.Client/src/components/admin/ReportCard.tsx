import React from 'react';
import { AlertCircle, Clock, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ReportActions from './ReportActions';

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

interface ReportCard {
    report: Report;
    onInvestigate: (id: number) => void;
    onResolve: (id: number) => void;
    onReject: (id: number) => void;
    onViewOriginal: (id: number) => void;
}

const ReportCard: React.FC<ReportCard> = ({
    report,
    onInvestigate,
    onResolve,
    onReject,
    onViewOriginal,
}) => {
    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            spam: 'Spam',
            harassment: 'Quấy rối',
            inappropriate: 'Nội dung xấu',
            misinformation: 'Thông tin sai',
            copyright: 'Bản quyền',
            hate_speech: 'Ngôn từ thù hận',
            other: 'Khác',
        };
        return labels[type] || type;
    };

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{report.reportedContent}</h3>
                                {report.evidence && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                        Có chứng cứ
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> {report.createdAt}
                                </span>
                                <span>•</span>
                                <span>Loại: <strong>{getTypeLabel(report.type)}</strong></span>
                                <span>•</span>
                                <span>Người báo cáo: <strong>{report.reportedBy}</strong></span>
                                <span>•</span>
                                <span>Bị báo cáo: <strong className="text-red-600">{report.reportedUser}</strong></span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <StatusBadge status={report.status} type="report" />
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {report.contentType === 'post' ? 'Bài viết' : 'Bình luận'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Lý do báo cáo:</p>
                        <p className="text-sm text-gray-700 mb-1">{report.reason}</p>
                        <p className="text-sm text-gray-600">{report.description}</p>
                    </div>

                    {report.resolution && (
                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-green-900 mb-1">Kết quả xử lý:</p>
                            <p className="text-sm text-green-700">{report.resolution}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => onViewOriginal(report.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Xem nội dung gốc
                        </button>

                        <ReportActions
                            report={report}
                            onInvestigate={onInvestigate}
                            onResolve={onResolve}
                            onReject={onReject}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;