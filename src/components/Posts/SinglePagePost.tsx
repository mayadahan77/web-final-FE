import { FC, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { IComments, IPost, LastPostElementRefProps } from "../../Interfaces";
import Post from "./Post";
import { useLocation, useParams } from "react-router-dom";
import useUser from "../../hooks/useUser";
import avatar from "../../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const SinglePagePost: FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const { postId } = useParams();
  const [comments, setComments] = useState<IComments[]>([]);
  const [post, setPost] = useState<IPost | null>(location.state || null);
  const [newComment, setNewComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!location.state);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true);
  const [errorComments, setErrorComments] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalComments, setTotalComments] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchComments = async (postId: string, page: number) => {
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrorComments("No access token found");
        return;
      }

      const response = await apiClient.get(`/comments/post/${postId}?skip=${page * 10}&limit=10`, {
        headers: { Authorization: `JWT ${token}` },
      });

      const newComments = response.data.items;
      setComments((prevComments) => {
        const uniqueComments = new Map(prevComments.map((comment) => [comment._id, comment]));
        newComments.forEach((comment: IComments) => uniqueComments.set(comment._id, comment));
        return Array.from(uniqueComments.values());
      });
      setTotalComments(response.data.totalItems);
      setErrorComments(null);
    } catch (error: unknown) {
      setErrorComments(error instanceof Error ? error.message : "Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !post) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await apiClient.post(
        `/comments`,
        { content: newComment, postId: post._id },
        { headers: { Authorization: `JWT ${token}` } }
      );

      setComments((prevComments) => [...prevComments, response.data]);
      setNewComment("");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to add comment");
    }
  };

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found");
        return;
      }

      const response = await apiClient.get(`/posts/${postId}`, {
        headers: { Authorization: `JWT ${token}` },
      });

      setPost(response.data);
      fetchComments(response.data._id, 0);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      await apiClient.delete(`/comments/${commentId}`, {
        headers: { Authorization: `JWT ${token}` },
      });

      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
    } catch (error: unknown) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) => (comment._id === commentId ? { ...comment, content: newContent } : comment))
    );

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      return;
    }

    apiClient
      .put(`/comments/${commentId}`, { content: newContent }, { headers: { Authorization: `JWT ${token}` } })
      .catch((error) => {
        console.error("Error updating comment:", error);
      });
  };

  const lastCommentElementRef = useCallback(
    (node: LastPostElementRefProps["node"]) => {
      if (isLoadingComments) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && comments.length < totalComments) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingComments, comments.length, totalComments]
  );

  useEffect(() => {
    if (!post) {
      setIsLoading(true);
      fetchPost();
    } else {
      fetchComments(post._id, currentPage);
    }
  }, [postId, currentPage]);

  return (
    <div className={PostsPageStyle.pageContainer}>
      {isLoading ? (
        <Loader />
      ) : post ? (
        <>
          <Post currentPost={post} withActions={false} />
          <div className={PostsPageStyle.pageTitle}>Comments:</div>
          {error && <p className={PostsPageStyle.error}>{error}</p>}

          <div className={PostsPageStyle.commentsContainer}>
            <div className={PostsPageStyle.commentInput}>
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
              />
              <button onClick={addComment}>Post Comment</button>
            </div>

            {isLoadingComments ? (
              <Loader />
            ) : errorComments ? (
              <p className={PostsPageStyle.error}>{errorComments}</p>
            ) : comments.length > 0 ? (
              <div className={PostsPageStyle.commentSection}>
                {comments.map((comment, index) => (
                  <div
                    key={comment._id}
                    className={PostsPageStyle.comment}
                    ref={index === comments.length - 1 ? lastCommentElementRef : null}
                  >
                    <div className={PostsPageStyle.commentUser}>
                      <img
                        src={comment.senderProfile || avatar}
                        alt={comment.senderName}
                        className={PostsPageStyle.commentUserAvatar}
                      />
                      <span>{comment.senderName}</span>
                    </div>

                    {comment.isEditing ? (
                      <div className={PostsPageStyle.commentEdit}>
                        <textarea
                          value={comment.content}
                          onChange={(e) =>
                            setComments((prevComments) =>
                              prevComments.map((c) => (c._id === comment._id ? { ...c, content: e.target.value } : c))
                            )
                          }
                        />
                        <button
                          onClick={() => {
                            handleEditComment(comment._id, comment.content);
                            setComments((prevComments) =>
                              prevComments.map((c) => (c._id === comment._id ? { ...c, isEditing: false } : c))
                            );
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className={PostsPageStyle.commentContent}>{comment.content}</div>
                    )}

                    {comment.senderId === user?._id && !comment.isEditing && (
                      <div className={PostsPageStyle.actions}>
                        <button
                          className={PostsPageStyle.actionButton}
                          onClick={() =>
                            setComments((prevComments) =>
                              prevComments.map((c) => (c._id === comment._id ? { ...c, isEditing: true } : c))
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faPenAlt} /> Edit
                        </button>
                        <button className={PostsPageStyle.actionButton} onClick={() => handleDeleteComment(comment._id)}>
                          <FontAwesomeIcon icon={faTrashAlt} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        </>
      ) : (
        <p className={PostsPageStyle.error}>Error loading post</p>
      )}
    </div>
  );
};

export default SinglePagePost;
