import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
import Register from "./components/register.js";
import Login from "./components/login.js";
import UserList from "./pages/user.js";
import EditUser from "./pages/userEdit.js";

const App = () => {
  return (
   
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/edit-user/:id" element={<EditUser />} />
        </Routes>
      </Router>

  );
};

export default App;
