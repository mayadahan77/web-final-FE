import { FC, useEffect } from "react";
import ItemsList from "./ItemList/ItemsList";
import usePosts from "../hooks/usePosts";
import Posts from "../hooks/posts";

const PostsPage: FC = () => {
  const { posts, isLoading, error } = usePosts();
  console.log(posts);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log(user);
    // console.log(accessToken);

    // const username = user.username;
    // fetchUserData(username);
  }, []);

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ItemsList
        title="Posts"
        items={Posts.map((post) => post.title)}
        onItemSelected={(index) => console.log("Selected " + index)}
      />
    </div>
  );
};

export default PostsPage;
