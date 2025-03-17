import { useState } from "react";
import { IPost } from "../Interfaces";
import { postService } from "../api";

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

  const updatePost = async (postId: string, data: FormData | { [key: string]: Array<string> }) => {
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
