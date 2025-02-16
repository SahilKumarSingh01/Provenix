import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../api/axios'
import "./Login.css";
import GoogleLogo from "../assets/google.svg"; // Assume these SVGs exist
import GitHubLogo from "../assets/github.svg"; // Assume these SVGs exist
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleLogin =async (e) => {
    e.preventDefault();
    try{
      const response=await axios.post('/auth/login',{username,password});
      navigate("/");
    }catch(e){
        setError(e.response.data.message);
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
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">
          Login
        </button>
      </form>

      <div className="social-login">
        <button onClick={handleGoogleSignIn} className="google-button">
          <img src={GoogleLogo} alt="Google" className="social-icon" />
          Sign in with Google
        </button>
        <button onClick={handleGitHubSignIn} className="github-button">
          <img src={GitHubLogo} alt="GitHub" className="social-icon" />
          Sign in with GitHub
        </button>
      </div>

      <div className="login-links">
        <Link to="/signup">Don't have an account? Sign Up</Link>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login;
