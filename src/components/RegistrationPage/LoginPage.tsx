import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginPageStyle from "./LoginPage.module.css"; 

const LoginPage: FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username && password) {
      localStorage.setItem("user", JSON.stringify({ username }));
      navigate("/");
    } else {
      alert("Please enter both username and password");
    }
  };
//TODO: add validtion
  return (
    <div className={LoginPageStyle.Container}>
      <div className={LoginPageStyle.Box}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={LoginPageStyle.inputField}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={LoginPageStyle.inputField}
        />
        <button onClick={handleLogin} className={LoginPageStyle.Button}>
          Login
        </button>
        <div onClick={() => navigate("/SignUp")} className={LoginPageStyle.herf}>
          Sign Up
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
