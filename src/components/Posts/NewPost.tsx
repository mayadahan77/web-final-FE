import { FC, useEffect, useState } from "react";
import axios from "axios";
import NewPostStyle from "./Posts.module.css";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof schema>;

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const NewPost: FC = () => {
  const { register, handleSubmit, formState, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const location = useLocation(); // To retrieve state passed from the post page
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  // This useEffect will populate the form if we are in edit mode
  useEffect(() => {
    if (location.state?.postId) {
      setIsEditing(true);
      setPostId(location.state.postId);
      // Pre-fill the form with the current post data
      setValue("title", location.state.title);
      setValue("content", location.state.content);
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      let response;
      if (isEditing && postId) {
        // If editing, update the existing post
        response = await api.put(`/posts/${postId}`, data, {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Post updated: ", response.data);
      } else {
        // If not editing, create a new post
        response = await api.post("/posts", data, {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Post created: ", response.data);
      }

      navigate("/"); // Redirect after successful creation/update
    } catch (error) {
      console.error("Error submitting post: ", error);
    }
  };

  return (
    <div className={NewPostStyle.Container}>
      <div className={NewPostStyle.Box}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>{isEditing ? "Edit Post" : "New Post"}</h2>

          <div className={NewPostStyle.error}>
            {formState.errors.title && <div className="text-danger">{formState.errors.title.message}</div>}
          </div>
          <div className={NewPostStyle.formGroup}>
            <label>Title:</label>
            <input
              id="title"
              type="text"
              placeholder="Title"
              {...register("title")}
              className={NewPostStyle.inputField}
            />
          </div>

          <div className={NewPostStyle.error}>
            {formState.errors.content && <div className="text-danger">{formState.errors.content.message}</div>}
          </div>
          <div className={NewPostStyle.formGroup}>
            <label>Content:</label>
            <textarea id="content" placeholder="Content" {...register("content")} className={NewPostStyle.inputField} />
          </div>

          <button type="submit" className={NewPostStyle.Button}>
            {isEditing ? "Update Post" : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
