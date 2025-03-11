import { FC, useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { IPost, IUser } from "../../Interfaces";
import Post from "./Post";
import { useNavigate } from "react-router-dom";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const PostsPage: FC<{ user: IUser; userPosts: boolean }> = ({ user, userPosts }) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [myPosts, setMyPosts] = useState<boolean>(userPosts);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const addPost = () => {
    navigate("/new-post");
  };

  const fetchPosts = async (justCurrentUser: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        setIsLoading(false);
        return;
      }

      const api = justCurrentUser ? `/posts?sender=${user._id}` : "/posts";
      const response = await apiClient.get(api, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      setPosts(response.data || []);
    } catch (error: unknown) {
      console.error("Error fetching posts:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  useEffect(() => {
    if (user._id) {
      fetchPosts(myPosts);
    }
  }, [myPosts, user._id]);

  return (
    <div>
      {error && <p className={PostsPageStyle.error}>{error}</p>}
      {isLoading ? (
        <Loader />
      ) : (
        <div className={PostsPageStyle.pageContainer}>
          <div className={PostsPageStyle.PageHeader}>
            <div className={PostsPageStyle.pageTitle}>{myPosts ? "My Posts" : "All The Posts"}</div>
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
              posts.map((post) => (
                <Post key={post._id} currentPost={post} withActions={true} user={user} onDelete={handlePostDelete} />
              ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsPage;
