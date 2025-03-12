import { forwardRef, useState } from "react";
import { IPost } from "../../Interfaces";
import styles from "./Posts.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUser from "../../hooks/useUser";
import avatar from "../../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faPenAlt, faThumbsUp, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const Post = forwardRef<HTMLDivElement, { currentPost: IPost; withActions: boolean; onDelete?: (id: string) => void }>(
  ({ currentPost, withActions, onDelete }, ref) => {
    const navigate = useNavigate();
    const { user } = useUser();

    const [post, setPost] = useState<IPost>(currentPost);
    const usersIdLikes = Array.isArray(post.usersIdLikes) ? post.usersIdLikes : [];
    const hasUserLike = usersIdLikes.includes(user?._id || "");
    const [like, setLike] = useState<boolean>(hasUserLike);

    const handleLike = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        const updatedLikes = hasUserLike
          ? post.usersIdLikes.filter((id) => id !== user?._id)
          : [...post.usersIdLikes, user?._id];

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

        setPost(response.data);
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
      <div ref={ref} className={styles.post}>
        <div className={styles.userInfo}>
          <img className={styles.avatar} src={post.senderProfile || avatar} />
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
              <FontAwesomeIcon icon={faThumbsUp} /> Likes ({usersIdLikes.length})
            </button>
            <button className={styles.actionButton} onClick={navigatToSinglePost}>
              <FontAwesomeIcon icon={faComments} /> Comments ({post.commentsCount})
            </button>
            {post.senderId === user?._id && (
              <>
                <button className={styles.actionButton} onClick={() => handleEdit(post)}>
                  <FontAwesomeIcon icon={faPenAlt} /> Edit
                </button>
                <button className={styles.actionButton} onClick={handleDeletePost}>
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default Post;
