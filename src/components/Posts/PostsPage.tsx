import { FC, useEffect, useRef, useCallback, useState } from "react";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { LastPostElementRefProps } from "../../Interfaces";
import Post from "./Post";
import { useNavigate } from "react-router-dom";
import usePost from "../../hooks/usePost";
import useUser from "../../hooks/useUser";

const PostsPage: FC<{ userPosts: boolean }> = ({ userPosts }) => {
  const { posts, totalPosts, error, isLoading, fetchPosts, deletePost } = usePost();
  const [myPosts, setMyPosts] = useState<boolean>(userPosts);
  const [page, setPage] = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useUser();
  const observer = useRef<IntersectionObserver | null>(null);

  const addPost = () => {
    navigate("/new-post");
  };

  const lastPostElementRef = useCallback(
    (node: LastPostElementRefProps["node"]) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && posts.length < totalPosts) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, posts.length, totalPosts]
  );

  useEffect(() => {
    if (user?._id) {
      fetchPosts(page * 10, 10, myPosts ? user._id : undefined, page > 0);
    }
  }, [myPosts, user?._id, page]);

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  return (
    <div>
      {error && <p className={PostsPageStyle.error}>{error}</p>}
      {isLoading && page === 0 ? (
        <Loader />
      ) : (
        <div className={PostsPageStyle.pageContainer}>
          <div className={PostsPageStyle.PageHeader}>
            <div className={PostsPageStyle.pageTitle}>{myPosts ? "My Posts" : "All Posts"}</div>
            {!userPosts && (
              <div className={PostsPageStyle.buttonContainer}>
                <button
                  className={!myPosts ? PostsPageStyle.selectedButton : ""}
                  onClick={() => {
                    setMyPosts(false);
                    setPage(0);
                  }}
                >
                  All Posts
                </button>
                <button
                  className={myPosts ? PostsPageStyle.selectedButton : ""}
                  onClick={() => {
                    setMyPosts(true);
                    setPage(0);
                  }}
                >
                  My Posts
                </button>
                <button onClick={addPost}>Add Post</button>
              </div>
            )}
          </div>
          <div className={PostsPageStyle.postContainer}>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <Post
                  key={post._id}
                  currentPost={post}
                  withActions={true}
                  onDelete={handleDeletePost}
                  ref={index === posts.length - 1 ? lastPostElementRef : null}
                />
              ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
          {isLoading && <Loader />}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
