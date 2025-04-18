import { useState, useContext ,useEffect,useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.js"; // For API requests
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import styles from "../styles/UserMenu.module.css";

const UserMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser,user } = useContext(AuthContext); // Access setUser from AuthContext
  const menuRef = useRef(null);
  
  // Handle menu item clicks
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Logout Function (Send request to backend & clear user state)
  const handleLogout = async () => {
    try {
      const response = await axios.get("/auth/logout"); // Send logout request
      setUser(null); // Clear user from context
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    } finally {
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.profileBtn}>
        {children}
      </button>

      {isOpen && (
        <ul className={styles.dropdownMenu} >
          <li onClick={() => handleNavigate(`/dashboard/`)}>Dashboard</li>
          <li onClick={() => handleNavigate(`/profile/${user.username}`)}>Profile</li>
          <li onClick={() => handleNavigate("/course/create")}>Create</li>
          <li onClick={() => handleNavigate("/course/my-courses")}>Courses</li>
          <li onClick={() => handleNavigate("/course/my-enrollments")}>Enrollments</li>

          <li className={styles.logout} onClick={handleLogout}>Logout</li>
        </ul>
      )}
    </div>
  );
};

export default UserMenu;
