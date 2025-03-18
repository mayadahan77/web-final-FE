import { useState } from "react";
import { IComments } from "../Interfaces";
import { commentService } from "../api";
import { toast } from "react-toastify";

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
      toast.success("Comment created successfully!");
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
      toast.success("Comment upadted successfully!");
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
      toast.success("Comment deleted successfully!");
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
