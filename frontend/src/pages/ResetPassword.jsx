import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/form.module.css"; // Import CSS module

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("/auth/reset-password", { token, newPassword: password });
      setMessage(response.data.message);
      setError("");

      // Redirect to login page after successful reset
      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
      setMessage("");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        {error && <p className={styles["error-message"]}>{error}</p>}
        {message && <p className={styles["success-message"]}>{message}</p>}
        <button type="submit" className={styles["submit-button"]}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
