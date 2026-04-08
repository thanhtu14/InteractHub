import React from "react";

const NotificationsTab: React.FC = () => {
    return (
        <div className="space-y-4">
            <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                Nhận email thông báo
            </label>

            <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                Nhận thông báo hệ thống
            </label>
        </div>
    );
};

export default NotificationsTab;