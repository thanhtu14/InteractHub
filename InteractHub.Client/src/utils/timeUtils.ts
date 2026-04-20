export const getTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return "";
  
  // Chuẩn hóa format ngày tháng cho đa trình duyệt
  const normalizedDate = dateString.replace(" ", "T") + "Z";
  const now = new Date();
  const past = new Date(normalizedDate);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "vừa xong";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày`;
  
  return `${Math.floor(diffInDays / 7)} tuần`;
};