import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";
import {toast} from 'react-toastify'
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        console.log(error);
        toast.error('User session is not in backend');
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
