import { FC } from "react";
import { IPost } from "../../Interfaces";
import styles from "./Posts.module.css";
import { useNavigate } from "react-router-dom";

const Post: FC<{ post: IPost; withActions: boolean }> = ({ post, withActions }) => {
  const navigate = useNavigate();

  const navigatToSinglePost = () => {
    navigate(`/post/${post._id}`, { state: post });
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
          <button className={styles.actionButton}>👍 Like</button>
          <button className={styles.actionButton} onClick={navigatToSinglePost}>
            💬 Comment ({post.commentsCount})
          </button>
        </div>
      )}
    </div>
  );
};

export default Post;
