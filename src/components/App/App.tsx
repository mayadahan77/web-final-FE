import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage";
import PostsPage from "../PostsPage";
import Sidenav from "../Sidenav/Sidenav";
import AppStyle from "./App.module.css";
import Users from "../../hooks/users";
import UserProfile from "../UserProfile/UserProfile";
import SignUpPage from "../LoginPage/SignUpPage";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage
    const user = localStorage.getItem("user");
    if (user) {
      console.log("users");
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className={AppStyle.container}>
        {isAuthenticated && (
          <div className={AppStyle.navbar}>
            <Sidenav />
          </div>
        )}
        <div className={AppStyle.main}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <PostsPage /> : <Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/SignUp" element={<SignUpPage />} />
            <Route path="/profile" element={<UserProfile user={Users[0]} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
