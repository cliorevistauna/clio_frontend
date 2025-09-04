import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/UserManagement/Login";
import Home from "./pages/Home";
import RecoverPassword from "./pages/UserManagement/RecoverPassword";
import Register from "./pages/UserManagement/Register";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recover" element={<RecoverPassword />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;