import { FC, useEffect, useRef, useState } from "react";
import UserProfileStyle from "./UserProfile.module.css";
import Avatar from "../../assets/avatar.png";
import { IUser } from "../../Interfaces";
import axios from "axios";
import Loader from "../Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const UserProfile: FC<{ user: IUser }> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<IUser>(user);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO : this error i loading and all the api calling is reptitve maybe extract to somwhere

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    console.log("file ", selectedFile);

    if (selectedFile) {
      // Validate file type (only images allowed)
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      if (!validImageTypes.includes(selectedFile.type)) {
        alert("Invalid file type! Please select an image (JPEG, PNG, GIF, WebP).");
        return;
      }
      //setUserData({ ...userData, ["imgUrl"]: selectedFile }); // TODO: how to convert the file to img to send to the BE
      setFile(selectedFile);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userObj: IUser = JSON.parse(user);
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

                  <div className={UserProfileStyle.formGroup}>
                    <label>Email:</label>
                    <input type="email" name="email" value={userData.email} onChange={handleChange} />
                  </div>

                  <div className={UserProfileStyle.formGroup}>
                    <label>Password:</label>
                    <input type="password" name="password" value={userData.password} onChange={handleChange} />
                  </div>
                </>
              ) : (
                <>
                  <h2>{userData.fullName}</h2>
                  <p>User Name: {userData.userName}</p>
                  <p>Email: {userData.email}</p>
                  <p>Password: *******</p>
                </>
              )}

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
            {/* Show selected image preview */}
            <img src={file ? URL.createObjectURL(file) : Avatar} alt="User" className={UserProfileStyle.profilePic} />

            {/* Hidden file input */}
            <input
              className={UserProfileStyle.uploadPicInput}
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Clickable icon to trigger file selection */}
            <FontAwesomeIcon
              className={UserProfileStyle.uploadPicIcon}
              onClick={() => fileInputRef.current?.click()}
              icon={faImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
