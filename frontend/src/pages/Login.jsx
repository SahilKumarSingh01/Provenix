import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/form.module.css";
import GoogleLogo from "../assets/google.svg";
import GitHubLogo from "../assets/github.svg";
import { AuthContext } from "../context/AuthContext.jsx";
const SERVER_URL=import.meta.env.VITE_SERVER_URL;

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
    const authUrl = SERVER_URL+`/auth/${provider}`;
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(authUrl, "_blank", `width=${width},height=${height},top=${top},left=${left}`);
    const handleMessage = (event) => {
      // if (event.origin !== SERVER_URL) return; // Ensure it's from backend
      if (event.data.success) {
        setUser(event.data.user);
        navigate("/", { state: { user: event.data.user } });
      }
      window.removeEventListener("message", handleMessage);
    };
  
    window.addEventListener("message", handleMessage);
  };
  
  return (
    <div className={styles.formContainer}>
  <h2>Login</h2>
  <form onSubmit={handleLogin}>
    <input
      type="text"
      id="username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Username or email"
      className={styles.inputField}
    />
    <input
      type="password"
      id="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      className={styles.inputField}
    />
    {error && <p className={styles.errorMessage}>{error}</p>}
    <button type="submit" className={styles.submitButton}>
      Login
    </button>
  </form>

  <button onClick={() => handlePopupLogin("google")} className={styles.googleButton}>
    <img src={GoogleLogo} alt="Google" className={styles.socialIcon} />
    Sign in with Google
  </button>
  <button onClick={() => handlePopupLogin("github")} className={styles.githubButton}>
    <img src={GitHubLogo} alt="GitHub" className={styles.socialIcon} />
    Sign in with GitHub
  </button>

  <div className={styles.formLinks}>
    <Link to="/signup">Don't have an account? Sign Up</Link>
    <Link to="/forgot-password">Forgot Password?</Link>
  </div>
</div>

  );
};

export default Login;
