import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/form.module.css"; // Import CSS module

const EmailVerification = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location?.state?.email || "");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Send OTP to email
  const sendOtp = async () => {
    if (!email) {
      setError("Please enter your email.");
      setMessage("");
      return;
    }
    try {
      await axios.post("/auth/send-otp", { email });
      setMessage("OTP sent to your email!");
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to send OTP");
      setMessage("");
    }
  };

  // Handle OTP Input
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move to next input if not last and a digit is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      await axios.post("/auth/verify-otp", { email, otp: otpCode });
      navigate("/"); // Redirect to home after successful verification
    } catch (e) {
      setError(e.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Email Verification</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button onClick={sendOtp} className={styles.submitButton}>
        Send OTP
      </button>

      <form onSubmit={handleVerifyOtp}>
        <div className={styles.otpContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={styles.otpBox}
            />
          ))}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.successMessage}>{message}</p>}
        <button type="submit" className={styles.submitButton}>
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
