import { forwardRef, useState } from "react";
import { IPost } from "../../Interfaces";
import styles from "./Posts.module.css";
import { useNavigate } from "react-router-dom";
import usePost from "../../hooks/usePost";
import useUser from "../../hooks/useUser";
import avatar from "../../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faPenAlt, faThumbsUp, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const Post = forwardRef<HTMLDivElement, { currentPost: IPost; withActions: boolean; onDelete?: (id: string) => void }>(
  ({ currentPost, withActions, onDelete }, ref) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { updatePost } = usePost();

    const [post, setPost] = useState<IPost>(currentPost);
    const usersIdLikes = Array.isArray(post.usersIdLikes) ? post.usersIdLikes : [];
    const hasUserLike = usersIdLikes.includes(user?._id || "");
    const [like, setLike] = useState<boolean>(hasUserLike);

    const handleLike = async () => {
      try {
        const updatedLikes = hasUserLike
          ? post.usersIdLikes.filter((id) => id !== user?._id)
          : [...post.usersIdLikes, user?._id];

        await updatePost(post._id, { usersIdLikes: updatedLikes });
        setPost((prevPost) => ({
          ...prevPost,
          usersIdLikes: updatedLikes,
        }));
        setLike(!hasUserLike);
      } catch (error) {
        console.error("Error updating like: ", error);
      }
    };

    const navigatToSinglePost = () => {
      navigate(`/post/${post._id}`, { state: post });
    };

    const handleDeletePost = async () => {
      if (onDelete) onDelete(post._id);
      navigate("/");
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
