import React from "react";
import ProfileInfoTab from "./ProfileInfoTab";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import PreferencesTab from "./PreferencesTab";

interface Props {
    activeTab: string;
}

const ProfileTabContent: React.FC<Props> = ({ activeTab }) => {
    switch (activeTab) {
        case "profile":
            return <ProfileInfoTab />;
        case "security":
            return <SecurityTab />;
        case "notifications":
            return <NotificationsTab />;
        case "preferences":
            return <PreferencesTab />;
        default:
            return <ProfileInfoTab />;
    }
};

export default ProfileTabContent;