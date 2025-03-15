import { FC, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { IPost, LastPostElementRefProps } from "../../Interfaces";
import Post from "./Post";
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const PostsPage: FC<{ userPosts: boolean }> = ({ userPosts }) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [myPosts, setMyPosts] = useState<boolean>(userPosts);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useUser();
  const observer = useRef<IntersectionObserver | null>(null);

  const addPost = () => {
    navigate("/new-post");
  };

  const fetchPosts = async (justCurrentUser: boolean, page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        setIsLoading(false);
        return;
      }

      const api = justCurrentUser
        ? `/posts?sender=${user?._id}&skip=${page * 10}&limit=10`
        : `/posts?skip=${page * 10}&limit=10`;
      const response = await apiClient.get(api, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      const newPosts = response.data.items;
      if (page === 0) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => {
          const uniquePosts = new Map(prevPosts.map((post) => [post._id, post]));
          newPosts.forEach((post: IPost) => uniquePosts.set(post._id, post));
          return Array.from(uniquePosts.values());
        });
      }
      setTotalPosts(response.data.totalItems);
    } catch (error: unknown) {
      console.error("Error fetching posts:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  const lastPostElementRef = useCallback(
    (node: LastPostElementRefProps["node"]) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && posts.length < totalPosts) {
          setPage((prevPage) => prevPage + 1);
          setIsLoadingMore(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, posts.length, totalPosts]
  );

  useEffect(() => {
    if (user?._id) {
      fetchPosts(myPosts, page);
    }
  }, [myPosts, user?._id, page]);

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
                <button onClick={() => setMyPosts(false)}>All Posts</button>
                <button onClick={() => setMyPosts(true)}>My Posts</button>
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
                  onDelete={handlePostDelete}
                  ref={index === posts.length - 1 ? lastPostElementRef : null}
                />
              ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
          {isLoadingMore && <Loader />}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
