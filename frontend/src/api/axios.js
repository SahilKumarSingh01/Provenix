import axios from "axios";
const SERVER_URL=import.meta.env.VITE_SERVER_URL;
const axiosInstance = axios.create({
  baseURL:SERVER_URL,//'https://provenix.onrender.com',//'http://localhost:5000',
  withCredentials: true, // Important for sessions
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
