export const getTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return "";

  // Xử lý các format: "2024-01-15T10:30:00", "2024-01-15T10:30:00Z", "2024-01-15 10:30:00"
  let normalized = dateString.trim().replace(" ", "T");
  if (!normalized.endsWith("Z") && !normalized.includes("+")) {
    normalized += "Z";
  }

  const past = new Date(normalized);
  if (isNaN(past.getTime())) return "";

  const diffInSeconds = Math.floor((Date.now() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "vừa xong";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày`;

  return `${Math.floor(diffInDays / 7)} tuần`;
};