import { FC } from "react";
import { Link } from "react-router-dom";
import SidenavStyle from "./Sidenav.module.css";
import Logo from "../../assets/share.png";
import { IUser } from "../../Interfaces";

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  window.location.href = "/login";
};

const Sidenav: FC<{ user: IUser }> = ({ user }) => {
  return (
    <div className={SidenavStyle.container}>
      <img src={Logo} className={SidenavStyle.logo} />
      <div className={SidenavStyle.user}>Hello, {user.fullName}</div>
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
