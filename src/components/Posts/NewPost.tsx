import { FC } from "react";
import axios from "axios";
import NewPostStyle from "./Posts.module.css";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  title: z.string().min(1, "title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof schema>;

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const NewPost: FC = () => {
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await api.post(`/posts`, data, {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response: ", response);
      navigate("/"); // Navigate after successful submission
    } catch (error) {
      console.error("Error creating post: ", error);
    }
  };

  return (
    <div className={NewPostStyle.Container}>
      <div className={NewPostStyle.Box}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>New Post</h2>

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
            <input
              id="content"
              type="text"
              placeholder="Content"
              {...register("content")}
              className={NewPostStyle.inputField}
            />
          </div>
          <button type="submit" className={NewPostStyle.Button}>
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
