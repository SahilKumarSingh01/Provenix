import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',//'https://provenix.onrender.com',//'http://localhost:5000',
  withCredentials: true, // Important for sessions
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
