import { FC, useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { IComments, INTINAL_DATA_COMMENT, IPost, IUser } from "../../Interfaces";
import Post from "./Post";
import { useLocation } from "react-router-dom";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const SinglePagePost: FC<{ user: IUser }> = ({ user }) => {
  const location = useLocation();

  const [comments, setComments] = useState<IComments[]>([INTINAL_DATA_COMMENT]);
  const [post, setPost] = useState<IPost>(location.state);
  const [newComment, setNewComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await apiClient.get(`comments/post/${post._id}`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });
      setComments(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await apiClient.post(
        `comments`,
        { content: newComment, postId: post._id },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      setComments([...comments, response.data]);
      setNewComment(""); // Reset comment input field
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred while adding the comment.");
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className={PostsPageStyle.pageContainer}>
      <Post post={post} withActions={false} />
      <div className={PostsPageStyle.pageTitle}>Comments:</div>

      {error && <p>{error}</p>}

      {isLoading ? (
        <Loader />
      ) : (
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
                <div className={PostsPageStyle.commentContent}>{comment.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePagePost;
