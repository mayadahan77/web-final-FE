import { FC, useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { IComments, IPost, IUser } from "../../Interfaces";
import Post from "./Post";
import { useLocation, useParams } from "react-router-dom";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const SinglePagePost: FC<{ user: IUser }> = ({ user }) => {
  const location = useLocation();
  const { postId } = useParams();
  const [comments, setComments] = useState<IComments[]>([]);
  const [post, setPost] = useState<IPost | null>(location.state || null);
  const [newComment, setNewComment] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!location.state);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true);
  const [errorComments, setErrorComments] = useState<string | null>(null);

  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrorComments("No access token found");
        return;
      }

      const response = await apiClient.get(`/comments/post/${postId}`, {
        headers: { Authorization: `JWT ${token}` },
      });

      setComments(response.data);
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

      setComments([...comments, response.data]);
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
      fetchComments(response.data._id); // Fetch comments only after post loads
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

      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error: unknown) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    // Update comment locally first
    setComments(comments.map((comment) => (comment._id === commentId ? { ...comment, content: newContent } : comment)));

    // Then, update the comment on the server
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

  useEffect(() => {
    if (!post) {
      setIsLoading(true);
      fetchPost();
    } else {
      fetchComments(post._id);
    }
  }, [postId]);

  return (
    <div className={PostsPageStyle.pageContainer}>
      {isLoading ? (
        <Loader />
      ) : post ? (
        <>
          <Post currentPost={post} withActions={false} user={user} />
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
                {comments.map((comment) => (
                  <div key={comment._id} className={PostsPageStyle.comment}>
                    <div className={PostsPageStyle.commentUser}>
                      <img
                        src={comment.senderProfile || "/default-avatar.jpg"}
                        alt={comment.senderName}
                        className={PostsPageStyle.commentUserAvatar}
                      />
                      <span>{comment.senderName}</span>
                    </div>

                    {/* Editable content */}
                    {comment.isEditing ? (
                      <div className={PostsPageStyle.commentEdit}>
                        <textarea
                          value={comment.content}
                          onChange={(e) =>
                            setComments(
                              comments.map((c) => (c._id === comment._id ? { ...c, content: e.target.value } : c))
                            )
                          }
                        />
                        <button
                          onClick={() => {
                            handleEditComment(comment._id, comment.content);
                            setComments(comments.map((c) => (c._id === comment._id ? { ...c, isEditing: false } : c)));
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className={PostsPageStyle.commentContent}>{comment.content}</div>
                    )}

                    {comment.senderId === user._id && !comment.isEditing && (
                      <div className={PostsPageStyle.actions}>
                        <button
                          className={PostsPageStyle.actionButton}
                          onClick={() =>
                            setComments(comments.map((c) => (c._id === comment._id ? { ...c, isEditing: true } : c)))
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button className={PostsPageStyle.actionButton} onClick={() => handleDeleteComment(comment._id)}>
                          🗑️ Delete
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
