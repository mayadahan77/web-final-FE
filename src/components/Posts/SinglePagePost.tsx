import { FC, useEffect, useState, useRef, useCallback } from "react";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { LastPostElementRefProps } from "../../Interfaces";
import Post from "./Post";
import { useParams } from "react-router-dom";
import useUser from "../../hooks/useUser";
import usePost from "../../hooks/usePost";
import useComments from "../../hooks/useComments";
import avatar from "../../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faTrashAlt, faSave } from "@fortawesome/free-solid-svg-icons";

const SinglePagePost: FC = () => {
  const { user } = useUser();
  const { postId } = useParams();
  const { post, fetchPost, isLoading: isLoadingPost, error: postError } = usePost();
  const {
    comments,
    setComments,
    totalComments,
    error: commentsError,
    isLoading: isLoadingComments,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  } = useComments(postId!);
  const [newComment, setNewComment] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

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
      fetchPost(postId!);
    }
  }, [postId]);

  useEffect(() => {
    if (post) {
      fetchComments(currentPage * 10, 10, currentPage > 0);
    }
  }, [post, currentPage]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;
    await addComment(newComment);
    setNewComment("");
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    await updateComment(commentId, newContent);
    setComments((prevComments) =>
      prevComments.map((comment) => (comment._id === commentId ? { ...comment, isEditing: false } : comment))
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const toggleEditComment = (commentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) => (comment._id === commentId ? { ...comment, isEditing: !comment.isEditing } : comment))
    );
  };

  return (
    <div className={PostsPageStyle.pageContainer}>
      {isLoadingPost ? (
        <Loader />
      ) : post ? (
        <>
          <Post currentPost={post} withActions={false} />
          <div className={PostsPageStyle.pageTitle}>Comments:</div>
          {postError && <p className={PostsPageStyle.error}>{postError}</p>}

          <div className={PostsPageStyle.commentsContainer}>
            <div className={PostsPageStyle.commentInput}>
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
              />
              <button onClick={handleAddComment}>Post Comment</button>
            </div>

            {isLoadingComments ? (
              <Loader />
            ) : commentsError ? (
              <p className={PostsPageStyle.error}>{commentsError}</p>
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
                      <div>
                        <textarea
                          className={PostsPageStyle.commentEdit}
                          value={comment.content}
                          onChange={(e) =>
                            setComments((prevComments) =>
                              prevComments.map((c) => (c._id === comment._id ? { ...c, content: e.target.value } : c))
                            )
                          }
                        />
                        <div className={PostsPageStyle.actions}>
                          <button
                            className={PostsPageStyle.actionButton}
                            onClick={() => handleEditComment(comment._id, comment.content)}
                          >
                            <FontAwesomeIcon icon={faSave} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={PostsPageStyle.commentContent}>{comment.content}</div>
                    )}

                    {comment.senderId === user?._id && !comment.isEditing && (
                      <div className={PostsPageStyle.actions}>
                        <button className={PostsPageStyle.actionButton} onClick={() => toggleEditComment(comment._id)}>
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
