import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/form.module.css";
import GoogleLogo from "../assets/google.svg";
import GitHubLogo from "../assets/github.svg";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before request
    try {
      await axios.post("/auth/signup", { username, email, password });
      navigate("/email-verify", { state: { email } });
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong");
    }
  };
  // Function to open OAuth login in a popup
  const handlePopupLogin = (provider) => {
    const authUrl = `https://provenix.onrender.com/auth/${provider}`;
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(authUrl, "_blank", `width=${width},height=${height},top=${top},left=${left}`);
    const handleMessage = (event) => {
      if (event.origin !== "https://provenix.onrender.com") return; // Ensure it's from backend
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
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className={styles.inputField}
        />
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
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
        <button type="submit" className={styles.submitButton}>Sign Up</button>
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
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
};

export default Signup;