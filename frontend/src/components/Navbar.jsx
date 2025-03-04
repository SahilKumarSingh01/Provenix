import { useState, useContext} from "react";
import { Link } from "react-router-dom";
import {AuthProvider,AuthContext} from'../context/AuthContext.jsx';
// import axios from '../api/axios'
import defaultPicture from '../assets/defaultPicture.png';
import "../styles/navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {user,setUser}      = useContext(AuthContext);
  return (
    <nav className="navbar">
      <h1 className="logo">Provenix</h1>

      {/* Hamburger Menu Icon */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        <div className={isOpen ? "bar rotate1" : "bar"}></div>
        <div className={isOpen ? "bar hide" : "bar"}></div>
        <div className={isOpen ? "bar rotate2" : "bar"}></div>
      </div>

      {/* Navigation Links */}
      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/explore" className="nav-link" onClick={() => setIsOpen(false)}>Explore</Link>
        <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link>
        {user ? (
          <>
            <img 
              src={user.photo || defaultPicture} 
              alt="Profile" 
              className="profile-pic"
            />
            
            {/* <button className="logout-btn" >Logout</button> */}
          </>
        ) : (
          <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
