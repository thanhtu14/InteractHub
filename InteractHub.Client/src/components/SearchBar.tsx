import React, { useState, useEffect,type ChangeEvent } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Sử dụng Font Awesome

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Tìm kiếm..." }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Xử lý Debouncing - Đáp ứng Requirement F4 
  useEffect(() => {
    const handler = setTimeout(() => {
      // Chỉ gọi API khi người dùng đã nhập nội dung
      onSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md group">
      {/* Icon Search phía bên trái */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full bg-gray-50 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                   text-sm transition-all shadow-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
      />

      {/* Nút Xóa nhanh nội dung bên phải */}
      {searchTerm && (
        <button 
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
        >
          <FaTimes className="text-gray-400 hover:text-red-500" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;