import axiosInstance from "./axiosInstance";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

export interface FriendshipStatusDto {
  status: number | null;
  isRequester: boolean;
}

export interface FriendshipResponseDto {
  RequesterId: string;
  ReceiverId: string;
  Status: number;
  RequesterName: string;
  AvatarUrl: string;
  CreatedAt: string;
}

export interface UserDto {
  Id: string;
  Username: string;
  AvatarUrl: string;
}

export const friendshipService = {
  sendFriendRequest: (receiverId: string) =>
    axiosInstance
      .post<ApiRes<FriendshipResponseDto>>(`/api/friendships/request/${receiverId}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  removeFriendship: (friendId: string) =>
    axiosInstance
      .delete<ApiRes<null>>(`/api/friendships/unfriend/${friendId}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  getFriendsList: (userId: string) =>
    axiosInstance
      .get<ApiRes<UserDto[]>>(`/api/friendships/list/${userId}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  acceptRequest: (requesterId: string) => {
    const user = JSON.parse(localStorage.getItem("interact_hub_user") || "{}");
    const currentUserId = user.Id || user.id;
    return axiosInstance
      .put<ApiRes<FriendshipResponseDto>>(`/api/friendships/respond`, {
        requesterId,
        receiverId: currentUserId,
        status: 1,
      })
      .then((res) => ({ ...res, data: res.data.Data }));
  },

  cancelRequest: (receiverId: string) =>
    axiosInstance
      .delete<ApiRes<null>>(`/api/friendships/cancel/${receiverId}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  getFriendshipStatus: (targetUserId: string) =>
    axiosInstance
      .get<ApiRes<FriendshipStatusDto>>(`/api/friendships/status/${targetUserId}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  rejectRequest: (requesterId: string) =>
    axiosInstance
      .delete<ApiRes<null>>(`/api/friendships/reject/${requesterId}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  getPendingRequests: () =>
    axiosInstance
      .get<ApiRes<FriendshipResponseDto[]>>("/api/friendships/pending-requests")
      .then((res) => ({ ...res, data: res.data.Data })),
};