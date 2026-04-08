import React from 'react';

interface StatusBadge {
    status: string;
    type?: 'post' | 'user' | 'report'|'profile'; // 👈 thêm type
    className?: string;
}

const postStatus = {
    published: { label: 'Đã đăng', className: 'bg-green-100 text-green-700' },
    pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
    flagged: { label: 'Vi phạm', className: 'bg-red-100 text-red-700' },
    removed: { label: 'Đã xóa', className: 'bg-gray-100 text-gray-700' },
};

const userStatus = {
    active: { label: 'Hoạt động', className: 'bg-green-100 text-green-700' },
    inactive: { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-700' },
    suspended: { label: 'Đã khóa', className: 'bg-red-100 text-red-700' },
};

const reportStatus = {
    pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
    investigating: { label: 'Đang điều tra', className: 'bg-blue-100 text-blue-700' },
    resolved: { label: 'Đã giải quyết', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Đã từ chối', className: 'bg-gray-100 text-gray-700' },
};

const StatusBadge: React.FC<StatusBadge> = ({ status, type = 'post', className = '' }) => {
    let configMap: Record<string, { label: string; className: string }>; 
    // định nghĩa kiểu cho configMap là một object có key là string và value là một object chứa label và className
    switch (type) {
        case 'user':
            configMap = userStatus;
            break;
        case 'report':
            configMap = reportStatus;
            break;
        default:
            configMap = postStatus;
    }

    const config = configMap[status.toLowerCase()] || {
        label: status,
        className: 'bg-gray-100 text-gray-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className} ${className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;