import { FC, useEffect, useRef, useState } from "react";
import UserProfileStyle from "./UserProfile.module.css";
import Avatar from "../../assets/avatar.png";
import { INTINAL_DATA_USER, IUser } from "../../Interfaces";
import Loader from "../Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import PostsPage from "../Posts/PostsPage";
import useUser from "../../hooks/useUser";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileService } from "../../api";

const schema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  userName: z.string().min(1, "User Name is required"),
});

type FormData = z.infer<typeof schema>;

const UserProfile: FC = () => {
  const { user: fetchedUser, isLoading: userLoading, error: userError, updateUser } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<IUser>(fetchedUser || INTINAL_DATA_USER);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: userData.fullName,
      userName: userData.userName,
    },
  });

  useEffect(() => {
    if (fetchedUser) {
      setUserData(fetchedUser);
      setValue("fullName", fetchedUser.fullName);
      setValue("userName", fetchedUser.userName);
    }
  }, [fetchedUser, setValue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      if (!validImageTypes.includes(selectedFile.type)) {
        alert("Invalid file type! Please select an image (JPEG, PNG, GIF, WebP).");
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userData._id ?? "");

      try {
        const response = await fileService.uploadFile(formData);

        console.log("File uploaded successfully:", response.data);
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleSave = async (data: FormData) => {
    const updatedUser = await updateUser({ ...userData, ...data });
    if (updatedUser) {
      setUserData(updatedUser);
      setEditMode(false);
    }
  };

  return (
    <>
      <div className={UserProfileStyle.pageContainer}>
        <div className={UserProfileStyle.profileContainer}>
          <div>
            {userError && editMode && <p>{userError}</p>}
            {userLoading ? (
              <Loader />
            ) : (
              <div className={UserProfileStyle.userInfo}>
                {editMode ? (
                  <form onSubmit={handleSubmit(handleSave)}>
                    <div className={UserProfileStyle.formGroup}>
                      <label>Full Name:</label>
                      <input type="text" {...register("fullName")} />
                    </div>

                    <div className={UserProfileStyle.formGroup}>
                      <label>Username:</label>
                      <input type="text" {...register("userName")} />
                    </div>

                    <p>Email: {userData.email}</p>

                    <div className={UserProfileStyle.buttonContainer}>
                      <button type="submit" className={UserProfileStyle.saveBtn}>
                        Save
                      </button>
                    </div>

                    <div>
                      {formState.errors.fullName && (
                        <>
                          <div className="text-danger">{formState.errors.fullName.message}</div>
                          <div className="text-danger">{formState.errors.userName?.message}</div>
                        </>
                      )}
                    </div>
                  </form>
                ) : (
                  <>
                    <h2>{userData.fullName}</h2>
                    <p>User Name: {userData.userName}</p>
                    <p>Email: {userData.email}</p>

                    <div className={UserProfileStyle.buttonContainer}>
                      <button className={UserProfileStyle.editBtn} onClick={() => setEditMode(true)}>
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className={UserProfileStyle.imageContainer}>
            <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
              <img src={userData.imgUrl ? userData.imgUrl : Avatar} alt="User" className={UserProfileStyle.profilePic} />

              <input
                className={UserProfileStyle.uploadPicInput}
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />

              <FontAwesomeIcon
                className={UserProfileStyle.uploadPicIcon}
                onClick={() => fileInputRef.current?.click()}
                icon={faImage}
              />
            </div>
          </div>
        </div>
      </div>
      <PostsPage userPosts={true} />
    </>
  );
};

export default UserProfile;
