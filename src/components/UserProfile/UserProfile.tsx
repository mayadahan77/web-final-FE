import { FC, useEffect, useState } from "react";
import UserProfileStyle from "./UserProfile.module.css";
import Avatar from "../../assets/avatar.png";
import { IUser } from "../../Interfaces";
import axios from "axios";
import Loader from "../Loader";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const UserProfile: FC<{ user: IUser }> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<IUser>(user);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO : this error i loading and all the api calling is reptitve maybe extract to somwhere

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userObj: IUser = JSON.parse(user);
      console.log("users");
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
          Authorization: `Bearer ${token}`,
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
          <img src={userData.imgUrl ? userData.imgUrl : Avatar} alt="User" className={UserProfileStyle.profilePic} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
