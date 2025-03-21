import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios"; // Your API setup
import styles from "../styles/form.module.css"; // Import CSS module

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/forgot-password", { email });
      setMessage("Link sent to your email");
      setError("");
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
      setMessage("");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className={styles["error-message"]}>{error}</p>}
        {message && <p className={styles["success-message"]}>{message}</p>}
        <button type="submit" className={styles["submit-button"]}>
          Send Reset Link
        </button>
      </form>

      <div className={styles["form-links"]}>
        <Link to="/email-verify">Email not verified? Verify Email</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
