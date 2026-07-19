import React from "react";
import { Outlet } from "react-router-dom";
import { NavBar } from "../../component/NavBar.jsx";
import { Footer } from "../../component/Footer.jsx";
export const UserLayer = () => {
  return (
    <div>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default UserLayer;