import React from 'react';
import { Eye, CheckCircle, X } from 'lucide-react';

interface ReportActions {
    report: any;
    onInvestigate: (id: number) => void;
    onResolve: (id: number) => void;
    onReject: (id: number) => void;
}

const ReportActions: React.FC<ReportActions> = ({
    report,
    onInvestigate,
    onResolve,
    onReject,
}) => {
    if (report.status === 'pending') {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onInvestigate(report.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
                >
                    <Eye className="w-4 h-4" />
                    Điều tra
                </button>
                <button
                    onClick={() => onResolve(report.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-1"
                >
                    <CheckCircle className="w-4 h-4" />
                    Xác nhận vi phạm
                </button>
                <button
                    onClick={() => onReject(report.id)}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-1"
                >
                    <X className="w-4 h-4" />
                    Từ chối
                </button>
            </div>
        );
    }

    if (report.status === 'investigating') {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onResolve(report.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-1"
                >
                    <CheckCircle className="w-4 h-4" />
                    Giải quyết
                </button>
                <button
                    onClick={() => onReject(report.id)}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-1"
                >
                    <X className="w-4 h-4" />
                    Từ chối
                </button>
            </div>
        );
    }

    return null;
};

export default ReportActions;