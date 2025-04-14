import React, { useState } from "react";
import { Link,useLocation } from "react-router-dom";
import axios from "../api/axios"; // Your API setup
import styles from "../styles/form.module.css"; // Import CSS module

const ForgotPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location?.state?.email || "");
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
    <div className={styles.formContainer}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}
        <button type="submit" className={styles.submitButton}>
          Send Reset Link
        </button>
      </form>

      <div className={styles.formLinks}>
        <Link to="/email-verify" state={{email}}>Email not verified? Verify Email</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
