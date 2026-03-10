import React, { useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "../styles/main.css";
import maksebLogo from "../../../maksebLogo.png";
import AboutUsScreen from "./AboutUsScreen";
import ContactScreen from "./ContactScreen";
import LoginScreen from "./LoginScreen";

function Navbar() {
  const navRef = useRef();
  const [activeTab, setActiveTab] = useState("login"); // Initialize activeTab state

  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    showNavbar(); // Close the navbar when a tab is clicked
  };

  const isMobile = window.innerWidth <= 768
  return (
    <div>
      <header>
        <div><img
          src={maksebLogo}
          alt="react-logo"
          style={{ backgroundColor: "white", width: isMobile ? "70px" : "70px", height: isMobile ? "70px" : "70px" }} />
         <h4   style={{marginLeft:"20px",marginTop:"25px",fontSize:"20px"}} > Makseb Solution</h4></div>
        
        <nav ref={navRef}>
          {/* <a href="/#" onClick={() => handleTabChange("aboutUs")}>About Us</a> */}
          <a href="/#" onClick={() => handleTabChange("login")}>Login</a>
          <a href="/#" onClick={() => handleTabChange("contactScreen")}>Contact</a>
        
          <button className="nav-btn nav-close-btn" onClick={showNavbar}>
            <FaTimes />
          </button>
        </nav>
        <button className="nav-btn" onClick={showNavbar}>
          <FaBars />
        </button>
      </header>
      <div className="content-container" >
      {activeTab === "login" && <LoginScreen />}
        {/* {activeTab === "aboutUs" && <AboutUsScreen />} */}
        {activeTab === "contactScreen" && <ContactScreen />}
  
      </div>
    </div>
  );
}

export default Navbar;
