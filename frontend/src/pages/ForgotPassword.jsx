import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios"; // Your API setup
import '../styles/form.css'
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      setMessage("Link send to your email");
      setError("");
    } catch (error) {
      setError(error?.response?.data?.message);
      setMessage("");
    }
  };

  return (
    <div className="form-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="submit-button">Send Reset Link</button>
      </form>
      
      <div className='form-links'>
      <Link to="/email-verify">Email not verified? verify Email</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
