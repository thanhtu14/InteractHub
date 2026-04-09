import axiosInstance from "./axiosInstance";

export const friendshipService = {
  // Gửi lời mời kết bạn
  sendFriendRequest: (receiverId: string) => {
    return axiosInstance.post(`/api/friendships/request/${receiverId}`);
  },

  // Hủy lời mời đã gửi hoặc hủy kết bạn
  removeFriendship: (friendId: string) => {
    return axiosInstance.delete(`/api/friendships/${friendId}`);
  },

  // Chấp nhận lời mời kết bạn
  acceptRequest: (requesterId: string) => {
    return axiosInstance.put(`/api/friendships/accept/${requesterId}`);
  },

  // Kiểm tra trạng thái quan hệ (để đổi label nút bấm)
  getFriendshipStatus: (targetUserId: string) => {
    return axiosInstance.get<{ status: string }>(`/api/friendships/status/${targetUserId}`);
  }
};