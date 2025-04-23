import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";
import {toast} from 'react-toastify'
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const fetchUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.log(error);
      user&&toast.error(error.response.data?.message||"Something went wrong while logging you in");
      setUser(null);
    }
  };
  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 25*60*1000); // 25 min interval
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser ,fetchUser}}>
      {children}
    </AuthContext.Provider>
  );
};
