import { FC, useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { INTINAL_DATA_POST, IPost, IUser } from "../../Interfaces";
import Post from "./Post";
import { useNavigate } from "react-router-dom";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const PostsPage: FC<{ user: IUser }> = ({ user }) => {
  const [posts, setPosts] = useState<[IPost]>([INTINAL_DATA_POST]);
  const [myPosts, setMyPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const addPost = () => {
    navigate("/new-post");
  };

  const fetchPosts = async (justCurrentUser: boolean) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const api = justCurrentUser ? `/posts?sender=${user._id}` : "/posts";
      const response = await apiClient.get(api, {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(myPosts).then((data) => {
      console.log("posts", data);
      if (data) setPosts(data);
    });
  }, [myPosts]);

  return (
    <div>
      {error && <p>{error}</p>}
      {isLoading ? (
        <Loader />
      ) : (
        <div className={PostsPageStyle.pageContainer}>
          <div className={PostsPageStyle.PageHeader}>
            <div className={PostsPageStyle.pageTitle}>{myPosts ? "My Posts" : "All The Posts"}</div>
            <div className={PostsPageStyle.buttonContainer}>
              <button onClick={() => setMyPosts(false)}>All Posts</button>
              <button onClick={() => setMyPosts(true)}>My Posts</button>
              <button onClick={addPost}>Add Post</button>
            </div>
          </div>
          <div className={PostsPageStyle.postContainer}>
            {posts.map((post) => (
              <Post post={post} withActions={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsPage;
