import { FC, useState } from "react";
import axios from "axios";
import LoginPageStyle from "./LoginPage.module.css";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import useUser from "../../hooks/useUser";
import Loader from "../Loader";

const schema = z.object({
  emailOrUserName: z.string().min(1, "Email or User Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

const api = axios.create({
  baseURL: "http://localhost:80",
});

const LoginPage: FC = () => {
  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", data);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      setError(error.response.data);
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const googleResponseMessage = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/googleSignin", { credential: credentialResponse });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      setError("Google login failed. Please try again.");
      console.error("Google login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const googleErrorMessage = () => {
    setError("Google login failed. Please try again.");
    console.log("Google Error");
  };

  return (
    <div className={LoginPageStyle.Container}>
      <div className={LoginPageStyle.Box}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Login</h2>
          {error && <div className="text-danger">{error}</div>}
          <div className={LoginPageStyle.formGroup}>
            <label>Email / User Name:</label>
            <input
              id="emailOrUserName"
              type="text"
              placeholder="Email"
              {...register("emailOrUserName")}
              className={LoginPageStyle.inputField}
            />
          </div>
          <div className={LoginPageStyle.error}>
            {formState.errors.password && <div className="text-danger">{formState.errors.password.message}</div>}
          </div>
          <div className={LoginPageStyle.formGroup}>
            <label>Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              {...register("password")}
              className={LoginPageStyle.inputField}
            />
          </div>
          <button type="submit" className={LoginPageStyle.Button} disabled={isLoading}>
            {isLoading ? <Loader /> : "Login"}
          </button>
          <div className={LoginPageStyle.Google}>
            <GoogleLogin onSuccess={googleResponseMessage} onError={googleErrorMessage} />
          </div>
        </form>
        <div onClick={() => navigate("/SignUp")} className={LoginPageStyle.herf}>
          SignUp
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
