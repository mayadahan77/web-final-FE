import { useEffect, useState } from "react";
import postService, { Post } from "../services/post-service";

const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("Effect");
    setIsLoading(true);
    const request = postService.getAllPosts();
    setPosts(request);
    setIsLoading(false);
  }, []);
  return { posts, setPosts, error, setError, isLoading, setIsLoading };
};

export default usePosts;
