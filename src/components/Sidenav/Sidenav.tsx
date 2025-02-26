import { FC } from "react";
import { Link } from "react-router-dom";
import Users from "../../hooks/users";
import SidenavStyle from "./Sidenav.module.css";
import avatar from "../../assets/avatar.png";

const Sidenav: FC = () => {
  return (
    <div className={SidenavStyle.container}>
      <div className={SidenavStyle.user}>
        <img src={avatar} className={SidenavStyle.profilePic} />
        {Users[0].fullName}
      </div>
      <nav className={SidenavStyle.nav}>
        <Link to="/login">Login</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/">Posts</Link>
        <Link to="/SignUp">SignUp</Link>
      </nav>
    </div>
  );
};

export default Sidenav;
