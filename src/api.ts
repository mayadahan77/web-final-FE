import axios from "axios";
import { IUser } from "./Interfaces";

const api = axios.create({
  baseURL: "http://193.106.55.215:80",
});
api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `JWT ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await api.post("/refresh", { token: refreshToken });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      api.defaults.headers.common["Authorization"] = `JWT ${newAccessToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export const userService = {
  updateUser: (userData: IUser) => {
    return api.put<IUser>(`/users/${userData._id}`, userData);
  },
  getUser: (userId: string) => {
    return api.get<IUser>(`/users/${userId}`);
  },
};

export const postService = {
  getPosts: (skip: number, limit: number, userId?: string) => {
    const url = userId ? `/posts?sender=${userId}&skip=${skip}&limit=${limit}` : `/posts?skip=${skip}&limit=${limit}`;
    return api.get(url);
  },
  getPost: (postId: string) => {
    return api.get(`/posts/${postId}`);
  },
  createPost: (data: FormData) => {
    return api.post("/posts", data);
  },
  updatePost: (postId: string, data: FormData | { [key: string]: Array<string> }) => {
    return api.put(`/posts/${postId}`, data);
  },
  deletePost: (postId: string) => {
    return api.delete(`/posts/${postId}`);
  },
  removeImage: (postId: string) => {
    return api.put(`/posts/removeImage/${postId}`);
  },
};

export const commentService = {
  getComments: (postId: string, skip: number, limit: number) => {
    return api.get(`/comments/post/${postId}?skip=${skip}&limit=${limit}`);
  },
  addComment: (postId: string, content: string) => {
    return api.post(`/comments`, { postId, content });
  },
  updateComment: (commentId: string, content: string) => {
    return api.put(`/comments/${commentId}`, { content });
  },
  deleteComment: (commentId: string) => {
    return api.delete(`/comments/${commentId}`);
  },
};
