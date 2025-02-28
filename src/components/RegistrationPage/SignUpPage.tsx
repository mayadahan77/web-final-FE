import { FC, useState } from "react";
import axios from "axios";
import LoginPageStyle from "./LoginPage.module.css";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const SignUpPage: FC = () => {
  const [userName, setuserName] = useState("");
  const [fullName, setfullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = () => {
    console.log("Logging in with", userName, password);
    api
      .post("/auth/register", {
        email,
        fullName,
        userName,
        password,
      })
      .then((rsep) => {
        localStorage.setItem("accessToken", rsep.data.accessToken);
        localStorage.setItem("refreshToken", rsep.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(rsep.data));
        window.location.href = "/";
      });
  };
  //TODO: add validtion

  return (
    <div className={LoginPageStyle.Container}>
      <div className={LoginPageStyle.Box}>
        <h2>SignUp</h2>
        <input
          type="text"
          placeholder="userName"
          value={userName}
          onChange={(e) => setuserName(e.target.value)}
          className={LoginPageStyle.inputField}
        />
        <input
          type="text"
          placeholder="fullName"
          value={fullName}
          onChange={(e) => setfullName(e.target.value)}
          className={LoginPageStyle.inputField}
        />
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={LoginPageStyle.inputField}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={LoginPageStyle.inputField}
        />
        <button onClick={handleSignUp} className={LoginPageStyle.Button}>
          SignUp
        </button>
        <div onClick={() => navigate("/login")} className={LoginPageStyle.herf}>
          Login
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
