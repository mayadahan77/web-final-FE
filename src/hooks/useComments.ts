import { useState } from "react";
import axios from "axios";
import { IComments } from "../Interfaces";

const api = axios.create({
  baseURL: "http://localhost:3000",
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

const commentService = {
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

const useComments = (postId: string) => {
  const [comments, setComments] = useState<IComments[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchComments = async (skip: number, limit: number, append = false) => {
    try {
      setIsLoading(true);
      const response = await commentService.getComments(postId, skip, limit);
      setComments((prevComments) => (append ? [...prevComments, ...response.data.items] : response.data.items));
      setTotalComments(response.data.totalItems);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      setIsLoading(true);
      const response = await commentService.addComment(postId, content);
      setComments((prevComments) => [...prevComments, response.data]);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      setIsLoading(true);
      const response = await commentService.updateComment(commentId, content);
      setComments((prevComments) => prevComments.map((comment) => (comment._id === commentId ? response.data : comment)));
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update comment");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setIsLoading(true);
      await commentService.deleteComment(commentId);
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete comment");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comments,
    setComments,
    totalComments,
    error,
    isLoading,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
};

export default useComments;
