// import { useState } from 'react';
// import { Mail, Phone, MapPin, Calendar, Shield, Key, Bell, Globe, Save, Camera } from 'lucide-react';

// export function ProfileAdminPage() {
//     const [activeTab, setActiveTab] = useState('profile');

//     return (
//         <div className="space-y-6">
//             <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
//                 <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản admin của bạn</p>
//             </div>

//             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                 <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
//                     <button className="absolute bottom-4 right-4 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1">
//                         <Camera className="w-4 h-4" />
//                         Đổi ảnh bìa
//                     </button>
//                 </div>

//                 <div className="px-6 pb-6">
//                     <div className="flex items-end gap-6 -mt-16 mb-6">
//                         <div className="relative">
//                             <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white">
//                                 A
//                             </div>
//                             <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
//                                 <Camera className="w-5 h-5 text-gray-600" />
//                             </button>
//                         </div>

//                         <div className="flex-1 pb-4">
//                             <h3 className="text-2xl font-bold text-gray-900">Admin User</h3>
//                             <p className="text-gray-600 flex items-center gap-2 mt-1">
//                                 <Shield className="w-4 h-4" />
//                                 Super Administrator
//                             </p>
//                             <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
//                                 <span className="flex items-center gap-1">
//                                     <Mail className="w-4 h-4" />
//                                     admin@example.com
//                                 </span>
//                                 <span className="flex items-center gap-1">
//                                     <Calendar className="w-4 h-4" />
//                                     Tham gia ngày 01/01/2024
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="border-b border-gray-200 mb-6">
//                         <nav className="flex gap-8">
//                             <button
//                                 onClick={() => setActiveTab('profile')}
//                                 className={`pb-4 border-b-2 font-medium transition-colors ${activeTab === 'profile'
//                                         ? 'border-blue-600 text-blue-600'
//                                         : 'border-transparent text-gray-600 hover:text-gray-900'
//                                     }`}
//                             >
//                                 Thông tin cá nhân
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('security')}
//                                 className={`pb-4 border-b-2 font-medium transition-colors ${activeTab === 'security'
//                                         ? 'border-blue-600 text-blue-600'
//                                         : 'border-transparent text-gray-600 hover:text-gray-900'
//                                     }`}
//                             >
//                                 Bảo mật
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('notifications')}
//                                 className={`pb-4 border-b-2 font-medium transition-colors ${activeTab === 'notifications'
//                                         ? 'border-blue-600 text-blue-600'
//                                         : 'border-transparent text-gray-600 hover:text-gray-900'
//                                     }`}
//                             >
//                                 Thông báo
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('preferences')}
//                                 className={`pb-4 border-b-2 font-medium transition-colors ${activeTab === 'preferences'
//                                         ? 'border-blue-600 text-blue-600'
//                                         : 'border-transparent text-gray-600 hover:text-gray-900'
//                                     }`}
//                             >
//                                 Tùy chỉnh
//                             </button>
//                         </nav>
//                     </div>

//                     {activeTab === 'profile' && (
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Họ và tên
//                                     </label>
//                                     <input
//                                         type="text"
//                                         defaultValue="Admin User"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Email
//                                     </label>
//                                     <input
//                                         type="email"
//                                         defaultValue="admin@example.com"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Số điện thoại
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         defaultValue="+84 123 456 789"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Vị trí
//                                     </label>
//                                     <input
//                                         type="text"
//                                         defaultValue="Hà Nội, Việt Nam"
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Tiểu sử
//                                 </label>
//                                 <textarea
//                                     rows={4}
//                                     defaultValue="Quản trị viên cấp cao của hệ thống mạng xã hội. Chịu trách nhiệm quản lý và điều hành toàn bộ nền tảng."
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                             </div>

//                             <div className="pt-4 border-t border-gray-200">
//                                 <h4 className="font-semibold text-gray-900 mb-4">Thông tin quản trị</h4>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <p className="text-sm text-gray-600 mb-1">Vai trò</p>
//                                         <p className="text-lg font-semibold text-gray-900">Super Admin</p>
//                                     </div>
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <p className="text-sm text-gray-600 mb-1">Quyền hạn</p>
//                                         <p className="text-lg font-semibold text-gray-900">Toàn quyền</p>
//                                     </div>
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
//                                         <p className="text-lg font-semibold text-green-600">Hoạt động</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4">
//                                 <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
//                                     Hủy bỏ
//                                 </button>
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
//                                     <Save className="w-4 h-4" />
//                                     Lưu thay đổi
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'security' && (
//                         <div className="space-y-6">
//                             <div>
//                                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                     <Key className="w-5 h-5" />
//                                     Đổi mật khẩu
//                                 </h4>
//                                 <div className="space-y-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Mật khẩu hiện tại
//                                         </label>
//                                         <input
//                                             type="password"
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Mật khẩu mới
//                                         </label>
//                                         <input
//                                             type="password"
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Xác nhận mật khẩu mới
//                                         </label>
//                                         <input
//                                             type="password"
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="pt-6 border-t border-gray-200">
//                                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                     <Shield className="w-5 h-5" />
//                                     Xác thực hai yếu tố (2FA)
//                                 </h4>
//                                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                                     <div>
//                                         <p className="font-medium text-gray-900">Bật xác thực hai yếu tố</p>
//                                         <p className="text-sm text-gray-600 mt-1">
//                                             Tăng cường bảo mật tài khoản với xác thực hai yếu tố
//                                         </p>
//                                     </div>
//                                     <label className="relative inline-flex items-center cursor-pointer">
//                                         <input type="checkbox" className="sr-only peer" />
//                                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                                     </label>
//                                 </div>
//                             </div>

//                             <div className="pt-6 border-t border-gray-200">
//                                 <h4 className="font-semibold text-gray-900 mb-4">Phiên đăng nhập</h4>
//                                 <div className="space-y-3">
//                                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                                         <div>
//                                             <p className="font-medium text-gray-900">Chrome trên Windows</p>
//                                             <p className="text-sm text-gray-600">Hà Nội, Việt Nam • Đang hoạt động</p>
//                                         </div>
//                                         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                                             Hiện tại
//                                         </span>
//                                     </div>
//                                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                                         <div>
//                                             <p className="font-medium text-gray-900">Safari trên iPhone</p>
//                                             <p className="text-sm text-gray-600">Hà Nội, Việt Nam • 2 giờ trước</p>
//                                         </div>
//                                         <button className="text-sm text-red-600 hover:text-red-700 font-medium">
//                                             Đăng xuất
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4">
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
//                                     <Save className="w-4 h-4" />
//                                     Cập nhật bảo mật
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'notifications' && (
//                         <div className="space-y-6">
//                             <div>
//                                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                     <Bell className="w-5 h-5" />
//                                     Thông báo qua Email
//                                 </h4>
//                                 <div className="space-y-4">
//                                     {[
//                                         { label: 'Bài viết mới cần duyệt', desc: 'Nhận thông báo khi có bài viết mới cần kiểm duyệt' },
//                                         { label: 'Reports mới', desc: 'Nhận thông báo khi có báo cáo vi phạm mới' },
//                                         { label: 'Người dùng mới', desc: 'Nhận thông báo khi có người dùng mới đăng ký' },
//                                         { label: 'Hoạt động bất thường', desc: 'Nhận cảnh báo về các hoạt động bất thường' },
//                                     ].map((item, index) => (
//                                         <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                                             <div>
//                                                 <p className="font-medium text-gray-900">{item.label}</p>
//                                                 <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
//                                             </div>
//                                             <label className="relative inline-flex items-center cursor-pointer">
//                                                 <input type="checkbox" className="sr-only peer" defaultChecked />
//                                                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="pt-6 border-t border-gray-200">
//                                 <h4 className="font-semibold text-gray-900 mb-4">Thông báo đẩy</h4>
//                                 <div className="space-y-4">
//                                     {[
//                                         { label: 'Thông báo trên trình duyệt', desc: 'Nhận thông báo đẩy ngay cả khi không mở trang' },
//                                         { label: 'Thông báo khẩn cấp', desc: 'Nhận thông báo ngay lập tức cho các vấn đề quan trọng' },
//                                     ].map((item, index) => (
//                                         <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                                             <div>
//                                                 <p className="font-medium text-gray-900">{item.label}</p>
//                                                 <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
//                                             </div>
//                                             <label className="relative inline-flex items-center cursor-pointer">
//                                                 <input type="checkbox" className="sr-only peer" defaultChecked />
//                                                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4">
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
//                                     <Save className="w-4 h-4" />
//                                     Lưu cài đặt
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'preferences' && (
//                         <div className="space-y-6">
//                             <div>
//                                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                                     <Globe className="w-5 h-5" />
//                                     Ngôn ngữ và khu vực
//                                 </h4>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Ngôn ngữ
//                                         </label>
//                                         <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                                             <option>Tiếng Việt</option>
//                                             <option>English</option>
//                                             <option>日本語</option>
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Múi giờ
//                                         </label>
//                                         <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                                             <option>GMT+7 (Hà Nội)</option>
//                                             <option>GMT+0 (London)</option>
//                                             <option>GMT-5 (New York)</option>
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="pt-6 border-t border-gray-200">
//                                 <h4 className="font-semibold text-gray-900 mb-4">Giao diện</h4>
//                                 <div className="space-y-4">
//                                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                                         <div>
//                                             <p className="font-medium text-gray-900">Chế độ tối</p>
//                                             <p className="text-sm text-gray-600 mt-1">Bật giao diện tối để giảm mỏi mắt</p>
//                                         </div>
//                                         <label className="relative inline-flex items-center cursor-pointer">
//                                             <input type="checkbox" className="sr-only peer" />
//                                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                                         </label>
//                                     </div>
//                                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                                         <div>
//                                             <p className="font-medium text-gray-900">Màn hình rộng</p>
//                                             <p className="text-sm text-gray-600 mt-1">Sử dụng toàn bộ chiều rộng màn hình</p>
//                                         </div>
//                                         <label className="relative inline-flex items-center cursor-pointer">
//                                             <input type="checkbox" className="sr-only peer" defaultChecked />
//                                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                                         </label>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 pt-4">
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
//                                     <Save className="w-4 h-4" />
//                                     Lưu tùy chỉnh
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
// export default ProfileAdminPage;

import React, { useState } from 'react';

import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ProfileHeader from '../../components/admin/ProfileHeader';
import ProfileTabs from '../../components/admin/ProfileTabs';
import ProfileTabContent from '../../components/admin/ProfileTabContent';

const ProfileAdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

    return (
        <div className="space-y-6 mx-1 my-4">
            <Header />
            <div className="flex-1 ml-64" >
                <Sidebar />
                <div className="p-16 p-6">
                    <ProfileHeader />

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        <ProfileTabContent activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileAdminPage;