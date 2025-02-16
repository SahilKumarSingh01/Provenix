import axios from "axios";

const BACKEND_URL = import.meta.env.BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Important for sessions
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
