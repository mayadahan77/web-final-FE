import { FC, useState } from "react";
import UserProfileStyle from "./UserProfile.module.css";
import Avatar from "../../assets/avatar.png";

interface User {
  _id?: string;
  email: string;
  userName: string;
  password: string;
  fullName: string;
  refreshToken?: string[];
  imgUrl?: string;
}

const UserProfile: FC<{ user: User }> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<User>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const onSave = (userData: User) => {
    console.log(userData);
  };

  const handleSave = () => {
    onSave(userData);
    setEditMode(false);
  };

  return (
    <div className={UserProfileStyle.profileContainer}>
      <div className={UserProfileStyle.imageContainer}>
        <img src={userData.imgUrl ? userData.imgUrl : Avatar} alt="User" className={UserProfileStyle.profilePic} />
        {editMode && (
          <input
            type="text"
            name="imgUrl"
            value={userData.imgUrl || ""}
            onChange={handleChange}
            placeholder="Image URL"
          />
        )}
      </div>

      <div className={UserProfileStyle.userInfo}>
        {editMode ? (
          <>
            <input type="text" name="fullName" value={userData.fullName} onChange={handleChange} />
            <input type="text" name="userName" value={userData.userName} onChange={handleChange} />
            <input type="email" name="email" value={userData.email} onChange={handleChange} />
            <input type="password" name="password" value={userData.password} onChange={handleChange} />
          </>
        ) : (
          <>
            <h2>{userData.fullName}</h2>
            <p>Username: {userData.userName}</p>
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
    </div>
  );
};

export default UserProfile;
