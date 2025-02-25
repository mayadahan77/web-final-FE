import { FC } from "react";
import { Link } from "react-router-dom";
import Users from "../../hooks/users";
import NavBarStyle from "./NavBar.module.css";
import avatar from "../../assets/avatar.png";

const Navbar: FC = () => {
  return (
    <div className={NavBarStyle.container}>
      <div className={NavBarStyle.user}>
        <img src={avatar} className={NavBarStyle.profilePic} />
        {Users[0].fullName}
      </div>
      <nav className={NavBarStyle.nav}>
        <Link to="/login">Login</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/">Posts</Link>
      </nav>
    </div>
  );
};

export default Navbar;
