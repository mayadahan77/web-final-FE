import { FC, useState } from "react";
import { IPost, IUser } from "../../Interfaces";
import styles from "./Posts.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const Post: FC<{ currentPost: IPost; withActions: boolean; user: IUser; onDelete?: (id: string) => void }> = ({
  currentPost,
  withActions,
  user,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [post, setPost] = useState<IPost>(currentPost);
  const usersIdLikes = Array.isArray(post.usersIdLikes) ? post.usersIdLikes : [];
  const hasUserLike = usersIdLikes.includes(user._id);
  const [like, setLike] = useState<boolean>(hasUserLike);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      // Toggle like state
      const updatedLikes = hasUserLike
        ? post.usersIdLikes.filter((id) => id !== user._id) // Remove user._id from likes if already liked
        : [...post.usersIdLikes, user._id]; // Add user._id to likes if not liked

      // Make API request to update likes
      const response = await api.put(
        `/posts/${post._id}`,
        { usersIdLikes: updatedLikes },
        {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the local post state with the updated post data
      setPost(response.data);
      // Toggle the like state based on the updated likes
      setLike(!hasUserLike);
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  const navigatToSinglePost = () => {
    navigate(`/post/${post._id}`, { state: post });
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      await api.delete(`/posts/${post._id}`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      if (onDelete) onDelete(post._id);
      navigate("/");
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  const handleEdit = (post: IPost) => {
    navigate("/new-post", {
      state: {
        postId: post._id,
        title: post.title,
        content: post.content,
        imgUrl: post.imgUrl,
      },
    });
  };

  return (
    <div className={styles.post}>
      <div className={styles.userInfo}>
        {post.senderProfile ? (
          <img className={styles.avatar} src={post.senderProfile} />
        ) : post.senderName ? (
          <div className={styles.avatar}>{post.senderName[0].toUpperCase()}</div>
        ) : (
          <div className={styles.avatar}>{post.senderId[0]?.toUpperCase()}</div>
        )}
        <div className={styles.userDetails}>
          <span className={styles.sender}>{post.senderName}</span>
        </div>
      </div>
      <h2 className={styles.title}>{post.title}</h2>
      <p className={styles.content}>{post.content}</p>

      {post.imgUrl && <img src={post.imgUrl} alt="Post" className={styles.image} />}

      {withActions && (
        <div className={styles.actions}>
          <button className={`${styles.actionButton} ${like ? styles.likedButton : ""}`} onClick={handleLike}>
            👍 Like ({usersIdLikes.length})
          </button>
          <button className={styles.actionButton} onClick={navigatToSinglePost}>
            💬 Comment ({post.commentsCount})
          </button>
          {post.senderId === user._id && (
            <>
              <button className={styles.actionButton} onClick={() => handleEdit(post)}>
                ✏️ Edit
              </button>
              <button className={styles.actionButton} onClick={handleDeletePost}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
