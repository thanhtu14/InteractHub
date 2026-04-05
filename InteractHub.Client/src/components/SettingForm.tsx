import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Định nghĩa kiểu dữ liệu cho User
interface User {
  id: string | number;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  birthday?: string;
  gender?: string;
}

interface SettingFormProps {
  user: User;
  onClose: () => void;
  onUpdateSuccess?: (updatedUser: any) => void;
}

const SettingForm: React.FC<SettingFormProps> = ({ user, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState<any>({});
  const [previewAvatar, setPreviewAvatar] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...user });
    if (user.avatarUrl) {
      setPreviewAvatar(`http://localhost:8080/uploads/${user.avatarUrl}`);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewAvatar(URL.createObjectURL(file));
      setFormData((prev: any) => ({ ...prev, avatarFile: file }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const form = new FormData();

    const userJson = {
      id: formData.id,
      fullName: formData.fullName,
      bio: formData.bio,
      birthday: formData.birthday,
      gender: formData.gender
    };

    const userBlob = new Blob([JSON.stringify(userJson)], { type: "application/json" });
    form.append("user", userBlob);

    if (formData.avatarFile) {
      form.append("avatarFile", formData.avatarFile);
    }

    try {
      const response = await axios.post("http://localhost:8080/auth/update", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Cập nhật thành công!");
      if (onUpdateSuccess) onUpdateSuccess(response.data);
      onClose();
    } catch (err) {
      alert("Cập nhật thất bại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#242526] w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-xl shadow-modal border border-[#3e4042] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-[#3e4042] flex justify-between items-center sticky top-0 bg-[#242526] z-10">
          <h2 className="text-xl font-bold text-textcolor mx-auto">Chỉnh sửa hồ sơ</h2>
          <button 
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full hover:bg-[#3a3b3c] text-textcolor transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img 
                src={previewAvatar || "https://via.placeholder.com/150"} 
                alt="avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-logocolor shadow-lg"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-sm font-medium"
              >
                Thay đổi
              </button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-texttitlecolor mb-1">Họ và tên</label>
              <input 
                name="fullName" 
                value={formData.fullName || ''} 
                onChange={handleChange}
                className="w-full bg-[#3a3b3c] border border-[#4e4f50] rounded-lg p-2.5 text-textcolor focus:border-logocolor outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-texttitlecolor mb-1">Tiểu sử</label>
              <textarea 
                name="bio" 
                rows={3}
                value={formData.bio || ''} 
                onChange={handleChange}
                placeholder="Mô tả một chút về bản thân..."
                className="w-full bg-[#3a3b3c] border border-[#4e4f50] rounded-lg p-2.5 text-textcolor focus:border-logocolor outline-none resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-texttitlecolor mb-1">Ngày sinh</label>
                <input 
                  type="date" 
                  name="birthday" 
                  value={formData.birthday || ''} 
                  onChange={handleChange}
                  className="w-full bg-[#3a3b3c] border border-[#4e4f50] rounded-lg p-2.5 text-textcolor focus:border-logocolor outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-texttitlecolor mb-1">Giới tính</label>
                <select 
                  name="gender" 
                  value={formData.gender || ''} 
                  onChange={handleChange}
                  className="w-full bg-[#3a3b3c] border border-[#4e4f50] rounded-lg p-2.5 text-textcolor focus:border-logocolor outline-none transition-all"
                >
                  <option value="">Chọn...</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-[#3e4042] flex justify-end gap-3 sticky bottom-0 bg-[#242526]">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-logocolor hover:bg-[#3a3b3c] transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2 bg-logocolor hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingForm;