import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // Assuming your axios instance is at this path
import { toast } from 'react-toastify'; // For toast notifications
import styles from '../styles/callback.module.css'; // Will create this CSS Module
const BACKEND_BASE_URL=import.meta.env.VITE_SERVER_URL;

// Callback component handles the OAuth redirect and token exchange
// It communicates with the window.opener (the main app window) and closes itself.
export default function Callback({ strategy }) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Processing login...');
  const [error, setError] = useState(null);

  // Base URL for your Render backend (replace with your actual Render URL)
  const BACKEND_CALLBACK_URL = `${BACKEND_BASE_URL}/auth/${strategy}/callback`;

  useEffect(() => {
    const handleOAuthCallback = async () => {
      setLoading(true);
      setMessage(`Exchanging authorization code for ${strategy} login...`);
      setError(null);
      const fullQueryString = window.location.search;
      // Get URL parameters from the browser's current URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state'); // Important for CSRF protection

      if (!code) {
        const errMsg = 'Authorization code not found in URL.';
        setError(errMsg);
        setMessage('Login failed.');
        toast.error(errMsg);
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'AUTH_FAILURE', 
            strategy: strategy, 
            error: errMsg 
          }, window.location.origin);
        }
        window.close();
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_CALLBACK_URL}${fullQueryString}`,{withCredentials:true});
        setMessage('Login successful! Closing window...');
        setLoading(false);
        toast.success(`Logged in with ${strategy}!`);
        if (window.opener) {
          window.opener.postMessage(response.data,window.location.origin);
        }
        window.close();

      } catch (err) {
        console.error('Error during token exchange:', err);
        const errorMessage = err?.response?.data?.message || 'An unknown error occurred during login.';
        setError(`Login failed: ${errorMessage}`);
        setMessage('An error occurred during login. Closing window...');
        setLoading(false);
        toast.error(`Login failed: ${errorMessage}`);
        window.close();
      }
    };

    handleOAuthCallback();
  }, [strategy, BACKEND_CALLBACK_URL]); 

   return (
    <div className={styles.callbackContainer}>
      <div className={styles.card}> {/* This div uses the .card class from your CSS module */}
        <h1 className={styles.title}>
          {loading ? 'Authenticating...' : 'Login Status'}
        </h1>
        {loading && (
          <div className={styles.spinner}></div>
        )}
        <p className={styles.message}>{message}</p>
        {error && (
          <div className={styles.errorMessageBlock} role="alert">
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && (
          <p className={styles.successMessage}>You're all set! Closing window.</p>
        )}
      </div>
    </div>
  );
}
