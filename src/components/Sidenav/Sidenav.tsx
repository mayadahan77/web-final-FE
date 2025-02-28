import { FC } from "react";
import { Link } from "react-router-dom";
import SidenavStyle from "./Sidenav.module.css";
import avatar from "../../assets/avatar.png";
import { IUser } from "../../Interfaces";

const handleLogout = () => {
  // Clear user data and token
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  // Redirect to login page
  window.location.href = "/login"; // Refresh to enforce logout
};

const Sidenav: FC<{ user: IUser }> = ({ user }) => {
  return (
    <div className={SidenavStyle.container}>
      <div className={SidenavStyle.user}>
        <img src={avatar} className={SidenavStyle.profilePic} />
        {user.fullName}
      </div>
      <nav className={SidenavStyle.nav}>
        <Link to="/profile">Profile</Link>
        <Link to="/">Posts</Link>
      </nav>
      <button className={SidenavStyle.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};
export default Sidenav;
