import { FC, useEffect, useRef, useState } from "react";
import UserProfileStyle from "./UserProfile.module.css";
import Avatar from "../../assets/avatar.png";
import { IUser } from "../../Interfaces";
import axios from "axios";
import Loader from "../Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import PostsPage from "../Posts/PostsPage";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const UserProfile: FC<{ user: IUser; onChangeUser: (user: IUser) => void }> = ({ user, onChangeUser }) => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<IUser>(user);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO : this error i loading and all the api calling is reptitve maybe extract to somwhere

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      // Validate file type (only images allowed)
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      if (!validImageTypes.includes(selectedFile.type)) {
        alert("Invalid file type! Please select an image (JPEG, PNG, GIF, WebP).");
        return;
      }
      const formData = new FormData();
      formData.append("file", selectedFile); // Attach the file
      formData.append("userId", userData._id ?? ""); // Attach userId as a string

      try {
        const response = await axios.post("http://localhost:3000/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("File uploaded successfully:", response.data);
        onChangeUser(response.data.user);
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user"); //TODO: maybe hook
    if (user) {
      const userObj: IUser = JSON.parse(user);
      console.log("user");
      console.log(user);

      setUserData(userObj);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const onSave = async (userData: IUser) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        setIsLoading(false);
        return;
      }

      const response = await api.put(`/users/${userData._id}`, userData, {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      });

      setIsLoading(false);
      localStorage.setItem("user", JSON.stringify(response.data));
      onChangeUser(response.data);
      setUserData(response.data);
      return response.data;
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }

      return null;
    }
  };

  const handleSave = () => {
    onSave(userData);
    setEditMode(false);
  };
  //TODO: add validtion to the edit i was able to remove the email and the user name not good!
  // I dont understand how it is posible since there is some validtion in the BE
  return (
    <>
      <div className={UserProfileStyle.pageContainer}>
        <div className={UserProfileStyle.profileContainer}>
          <div>
            {error && <p>{error}</p>}
            {isLoading ? (
              <Loader />
            ) : (
              <div className={UserProfileStyle.userInfo}>
                {editMode ? (
                  <>
                    <div className={UserProfileStyle.formGroup}>
                      <label>Full Name:</label>
                      <input type="text" name="fullName" value={userData.fullName} onChange={handleChange} />
                    </div>

                    <div className={UserProfileStyle.formGroup}>
                      <label>Username:</label>
                      <input type="text" name="userName" value={userData.userName} onChange={handleChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <h2>{userData.fullName}</h2>
                    <p>User Name: {userData.userName}</p>
                  </>
                )}
                <p>Email: {userData.email}</p>

                <div className={UserProfileStyle.buttonContainer}>
                  {editMode ? (
                    <button className={UserProfileStyle.saveBtn} onClick={handleSave}>
                      Save
                    </button>
                  ) : (
                    <button className={UserProfileStyle.editBtn} onClick={() => setEditMode(true)}>
                      Edit
                    </button>
                  )}
                </div>
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
      <PostsPage user={user} userPosts={true} />
    </>
  );
};

export default UserProfile;
