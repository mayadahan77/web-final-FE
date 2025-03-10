import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../RegistrationPage/LoginPage";
import PostsPage from "../Posts/PostsPage";
import Sidenav from "../Sidenav/Sidenav";
import AppStyle from "./App.module.css";
import UserProfile from "../UserProfile/UserProfile";
import SignUpPage from "../RegistrationPage/SignUpPage";
import { useEffect, useState } from "react";
import { INTINAL_DATA_USER, IUser } from "../../Interfaces";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser>(INTINAL_DATA_USER);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userObj: IUser = JSON.parse(user);
      setUser(userObj);
      setIsAuthenticated(true);
    }
  }, []);
  //TODO: maybe hook
  const onChange = (newUser: IUser) => {
    setUser(newUser);
  };

  return (
    <Router>
      <div className={AppStyle.container}>
        {isAuthenticated && (
          <div className={AppStyle.sidenav}>
            <Sidenav user={user} />
          </div>
        )}
        <div className={AppStyle.main}>
          <Routes>
            {" "}
            {isAuthenticated ? (
              <>
                <Route path="/" element={<PostsPage />} />
                <Route path="/profile" element={<UserProfile user={user} onChangeUser={onChange} />} />
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
