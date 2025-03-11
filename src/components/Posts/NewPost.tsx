import { FC, useEffect, useState, useRef } from "react";
import axios from "axios";
import NewPostStyle from "./Posts.module.css";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

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
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.postId) {
      setIsEditing(true);
      setPostId(location.state.postId);
      setValue("title", location.state.title);
      setValue("content", location.state.content);
      if (location.state.imgUrl) {
        setPreviewImage(location.state.imgUrl);
      }
    }
  }, [location.state, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      let response;
      if (isEditing && postId) {
        response = await api.put(`/posts/${postId}`, formData, {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Post updated: ", response.data);
      } else {
        response = await api.post("/posts", formData, {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Post created: ", response.data);
      }

      navigate("/");
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

          <div className={NewPostStyle.formGroup}>
            <label>Upload Image:</label>
            <input
              className={NewPostStyle.uploadPicInput}
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className={NewPostStyle.handlePicContainer}>
              <FontAwesomeIcon
                className={NewPostStyle.uploadPicIcon}
                onClick={() => fileInputRef.current?.click()}
                icon={faImage}
              />
            </div>
            {previewImage && <img src={previewImage} alt="Preview" className={NewPostStyle.image} />}
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
