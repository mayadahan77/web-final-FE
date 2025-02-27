import { FC, useEffect, useState } from "react";
// import ItemsList from "./ItemList/ItemsList";
import axios from "axios";
import Loader from "../Loader";
import PostsPageStyle from "./Posts.module.css";
import { INTINAL_DATA_POST, IPost } from "../../Interfaces";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

const PostsPage: FC = () => {
  const [posts, setPosts] = useState<[IPost]>([INTINAL_DATA_POST]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
      const response = await apiClient.get("/posts", {
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
    fetchPosts().then((data) => {
      console.log("posts", data);
      if (data) setPosts(data);
    });
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log(user);
    // console.log(accessToken);

    // const username = user.username;
    // fetchUserData(username);
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}
      {isLoading ? (
        <Loader />
      ) : (
        <div className={PostsPageStyle.pageContainer}>
          <div className={PostsPageStyle.postContainer}>
            {posts.map((post) => (
              <div className={PostsPageStyle.post}>{post.title}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsPage;
