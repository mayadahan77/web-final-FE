import { useState } from "react";
import axios from "axios";
import { IPost } from "../Interfaces";

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

const postService = {
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
  updatePost: (postId: string, data: FormData) => {
    return api.put(`/posts/${postId}`, data);
  },
  deletePost: (postId: string) => {
    return api.delete(`/posts/${postId}`);
  },
  removeImage: (postId: string) => {
    return api.put(`/posts/removeImage/${postId}`);
  },
};

const usePost = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [post, setPost] = useState<IPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPosts = async (skip: number, limit: number, userId?: string, append = false) => {
    try {
      setIsLoading(true);
      const response = await postService.getPosts(skip, limit, userId);
      setPosts((prevPosts) => (append ? [...prevPosts, ...response.data.items] : response.data.items));
      setTotalPosts(response.data.totalItems);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPost = async (postId: string) => {
    try {
      setIsLoading(true);
      const response = await postService.getPost(postId);
      setPost(response.data);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load post");
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (data: FormData) => {
    try {
      setIsLoading(true);
      const response = await postService.createPost(data);
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (postId: string, data: FormData) => {
    try {
      setIsLoading(true);
      const response = await postService.updatePost(postId, data);
      setPosts((prevPosts) => prevPosts.map((post) => (post._id === postId ? response.data : post)));
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      setIsLoading(true);
      await postService.deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete post");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async (postId: string) => {
    try {
      setIsLoading(true);
      const response = await postService.removeImage(postId);
      setPost(response.data);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to remove image");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    posts,
    totalPosts,
    post,
    error,
    isLoading,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    removeImage,
  };
};

export default usePost;
