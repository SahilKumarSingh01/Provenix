import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../api/axios'
import "../styles/form.css";
import GoogleLogo from "../assets/google.svg"; // Assume these SVGs exist
import GitHubLogo from "../assets/github.svg"; // Assume these SVGs exist
const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleLogin =async (e) => {
    e.preventDefault();
    try{
      const response=await axios.post('/auth/signup',{username,email,password});
      navigate("/email-verify",{state:{email}});
    }catch(e){
      setError(e?.response?.data?.message||"Something went wrong");
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async() => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  // Handle GitHub Sign-In
  const handleGitHubSignIn = async() => {
    window.location.href = "http://localhost:5000/auth/github";
  }

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleLogin}>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>

        <button onClick={handleGoogleSignIn} className="google-button">
          <img src={GoogleLogo} alt="Google" className="social-icon" />
          Sign in with Google
        </button>
        <button onClick={handleGitHubSignIn} className="github-button">
          <img src={GitHubLogo} alt="GitHub" className="social-icon" />
          Sign in with GitHub
        </button>

        <div className='form-links'>
        <Link to="/login">Already have account ? Login</Link>
        </div>
    </div>
  );
};

export default Signup;
