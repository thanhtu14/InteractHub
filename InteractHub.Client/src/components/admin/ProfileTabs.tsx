import React from 'react';
type TabType = 'profile' | 'security' | 'notifications' | 'preferences';

interface ProfileTabsProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: TabType; label: string }[] = [
        { id: 'profile', label: 'Thông tin cá nhân' },
        { id: 'security', label: 'Bảo mật' },
        { id: 'notifications', label: 'Thông báo' },
        { id: 'preferences', label: 'Tùy chỉnh' },
    ];

    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 border-b-2 ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};
export default ProfileTabs;