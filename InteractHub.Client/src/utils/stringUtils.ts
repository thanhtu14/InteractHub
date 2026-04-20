/**
 * Loại bỏ dấu tiếng Việt, chuyển về chữ thường và trim khoảng trắng
 */
export const removeVietnameseTones = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

/**
 * Ví dụ khác: Rút gọn văn bản quá dài
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};