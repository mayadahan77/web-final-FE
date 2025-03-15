import { FC, useEffect, useState, useRef } from "react";
import NewPostStyle from "./Posts.module.css";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import usePost from "../../hooks/usePost";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof schema>;

const NewPost: FC = () => {
  const { register, handleSubmit, formState, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { createPost, updatePost, removeImage, isLoading } = usePost();
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
      event.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (postId) {
      await removeImage(postId);
      setSelectedImage(null);
      setPreviewImage(null);
      toast.success("Image deleted successfully!");
    }
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    if (isEditing && postId) {
      await updatePost(postId, formData);
      toast.success("Post updated successfully!");
    } else {
      await createPost(formData);
      toast.success("Post created successfully!");
    }

    navigate("/");
  };

  return (
    <div className={NewPostStyle.Container}>
      <ToastContainer />
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

          <div className={NewPostStyle.errorContent}>
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
              <FontAwesomeIcon icon={faTrash} className={NewPostStyle.uploadPicIcon} onClick={handleDeleteImage} />
            </div>
            {previewImage && <img src={previewImage} alt="Preview" className={NewPostStyle.image} />}
          </div>

          <button type="submit" className={NewPostStyle.Button} disabled={isLoading}>
            {isEditing ? "Update Post" : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
