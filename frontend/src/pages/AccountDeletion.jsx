import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/form.module.css";
import { AuthContext } from "../context/AuthContext.jsx";
import { toast } from "react-toastify"; // Import toast

const AccountDeletion = () => {
  const [confirmation, setConfirmation] = useState(""); // Store the confirmation phrase input
  const { fetchUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Token not found!"); // Show error toast
    }
  }, [token]);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing token."); // Show error toast
      return;
    }

    if (confirmation !== "I want to permanently delete my account and all records") {
      toast.error("Confirmation phrase does not match. Account deletion cancelled."); // Show error toast
      return;
    }

    try {
      const response = await axios.delete(`/api/profile/delete-account`, {
        params: { token },
      });

      toast.success(response.data.message || "Account successfully deleted."); // Show success toast
      fetchUser();

      // Redirect to home or login after a short delay
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong with deletion."); // Show error toast
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Account Deletion</h2>
      <p>
        Are you sure you want to delete your account? This action is permanent. Your profile, courses, and personal data will be deleted.
        <br /><br />
        If you change your mind, you have 5 hours to recover your account.
        <br /><br />
        To confirm, please enter the following phrase:
        <strong>"I want to permanently delete my account and all records"</strong>
      </p>
      <form onSubmit={handleDeleteAccount}>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Enter the confirmation phrase"
          required
        />
        <button type="submit" className={styles.submitButton}>
          Confirm Deletion
        </button>
      </form>
    </div>
  );
};

export default AccountDeletion;
