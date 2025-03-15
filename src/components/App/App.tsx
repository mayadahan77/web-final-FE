import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../RegistrationPage/LoginPage";
import PostsPage from "../Posts/PostsPage";
import Sidenav from "../Sidenav/Sidenav";
import AppStyle from "./App.module.css";
import UserProfile from "../UserProfile/UserProfile";
import SignUpPage from "../RegistrationPage/SignUpPage";
import { useEffect, useState } from "react";
import NewPost from "../Posts/NewPost";
import SinglePagePost from "../Posts/SinglePagePost";
import useUser from "../../hooks/useUser";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  return (
    <Router>
      <div className={AppStyle.container}>
        {isAuthenticated && (
          <div className={AppStyle.sidenav}>
            <Sidenav />
          </div>
        )}
        <div className={AppStyle.main}>
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<PostsPage userPosts={false} />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/new-post" element={<NewPost />} />
                <Route path="/post/:postId" element={<SinglePagePost />} />
              </>
            ) : (
              <>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/SignUp" element={<SignUpPage />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
