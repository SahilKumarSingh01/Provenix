import React, { useState, useRef } from "react";
import { useNavigate ,useLocation} from "react-router-dom";

import axios from "../api/axios";
import "../styles/form.css";

const EmailVerification = () => {
  const location=useLocation();
  const [email, setEmail] = useState(location?.state?.email);
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
      navigate("/");
      // navigate("/reset-password"); // Redirect to password reset page
    } catch (e) {
      setError(e.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="form-container">
      <h2>Email Verification</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button onClick={sendOtp} className="submit-button">
        Send OTP
      </button>

      <form onSubmit={handleVerifyOtp} className="otp-form">
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-box"
            />
          ))}
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="submit-button">
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
