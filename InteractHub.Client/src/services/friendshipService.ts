import axiosInstance from "./axiosInstance";

export const friendshipService = {
  // Gửi lời mời
  sendFriendRequest: (receiverId: string) => {
    return axiosInstance.post(`/api/friendships/request/${receiverId}`);
  },

  // Hủy lời mời hoặc unfriend
  removeFriendship: (friendId: string) => {
    return axiosInstance.delete(`/api/friendships/unfriend/${friendId}`);
  },
  getFriendsList: (userId: string) => {
    return axiosInstance.get(`/api/friendships/list/${userId}`);
  },

  // Chấp nhận lời mời
  // Sửa lại trong friendshipService.ts
// friendshipService.ts
// friendshipService.ts
acceptRequest: (requesterId: string) => {
  // Lấy thông tin user hiện tại (là người nhận - Receiver)
  const user = JSON.parse(localStorage.getItem("interact_hub_user") || "{}");
  const currentUserId = user.Id || user.id; 

  return axiosInstance.put(`/api/friendships/respond`, {
    requesterId: requesterId, // ID người gửi lời mời
    receiverId: currentUserId, // ID của bạn (BẮT BUỘC theo lỗi trên)
    status: 1,                // 1 = Accept
  });
},

  // Từ chối lời mời
  // declineRequest: (requesterId: string) => {
  //   return axiosInstance.put(`/api/friendships/respond`, {
  //     requesterId,
  //     status: 0,
  //   });
  // },
  cancelRequest: (receiverId: string) => {
    return axiosInstance.delete(`/api/friendships/cancel/${receiverId}`);
  },

  // Lấy trạng thái
  getFriendshipStatus: (targetUserId: string) => {
    return axiosInstance.get<{
      status: number | null;
      isRequester: boolean;
    }>(`/api/friendships/status/${targetUserId}`);
  },
  rejectRequest: (requesterId: string) => {
    return axiosInstance.delete(`/api/friendships/reject/${requesterId}`);
  },
  // ✅ lấy danh sách lời mời chờ
 getPendingRequests: () => {
  return axiosInstance.get("/api/friendships/pending-requests");
}


};