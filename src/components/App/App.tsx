import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../LoginPage";
import PostsPage from "../PostsPage";
import Navbar from "../NavBar/NavBar";
import AppStyle from "./App.module.css";
import Users from "../../hooks/users";
import UserProfile from "../UserProfile/UserProfile";

function App() {
  return (
    <Router>
      <div className={AppStyle.container}>
        <div className={AppStyle.navbar}>
          <Navbar />
        </div>
        <div className={AppStyle.main}>
          <Routes>
            <Route path="/" element={<PostsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<UserProfile user={Users[0]} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
