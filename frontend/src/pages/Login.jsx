import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/form.css";
import GoogleLogo from "../assets/google.svg";
import GitHubLogo from "../assets/github.svg";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { username, password });
      setUser(response.data.user);
      navigate("/", { state: { user: response.data.user } });
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong");
    }
  };

  // Function to open OAuth login in a popup
  const handlePopupLogin = (provider) => {
    const authUrl = `http://localhost:5000/auth/${provider}`;
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(authUrl, "_blank", `width=${width},height=${height},top=${top},left=${left}`);

    const checkPopupClosed = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener("message", receiveMessage);
      }
    }, 500);

    const receiveMessage = (event) => {
      if (event.origin !== "https://provenix.onrender.com") return;

      if (event.data?.user) {
        setUser(event.data.user);
        navigate("/", { state: { user: event.data.user } });
      }
    };

    window.addEventListener("message", receiveMessage);
  };

  // Google & GitHub login handlers
  const handleGoogleSignIn = () => handlePopupLogin("google");
  const handleGitHubSignIn = () => handlePopupLogin("github");

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username or email"
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
          Login
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

      <div className="form-links">
        <Link to="/signup">Don't have an account? Sign Up</Link>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login;
