import { useState, useContext ,useEffect} from "react";
import { Link ,useNavigate} from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import defaultPicture from "../assets/defaultPicture.png";
import styles from "../styles/Navbar.module.css";
import UserMenu from "./UserMenu.jsx";

function Navbar() {
  const navigate=useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // initial check
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
    <nav className={styles.navbar}>
      <h1 className={styles.logo} onClick={()=>navigate('/')}>Provenix</h1>
      <div className={styles.mobileHeader}>
        {user&&isMobile&&
          <UserMenu>
            <img 
              src={user.photo || defaultPicture} 
              alt="Profile" 
              className={styles.profilePic}
            />
          </UserMenu>
        }
        {/* Hamburger Menu Icon */}
        <div className={styles.menuIcon} onClick={() => setIsOpen(!isOpen)}>
          <div className={isOpen ? `${styles.bar} ${styles.rotate1}` : styles.bar}></div>
          <div className={isOpen ? `${styles.bar} ${styles.hide}` : styles.bar}></div>
          <div className={isOpen ? `${styles.bar} ${styles.rotate2}` : styles.bar}></div>
        </div>
      </div>
      {/* Navigation Links */}
      <div className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
        <Link to="/" className={styles.navLink} onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/explore" className={styles.navLink} onClick={() => setIsOpen(false)}>Explore</Link>
        <Link to="/about" className={styles.navLink} onClick={() => setIsOpen(false)}>About</Link>
        <span
          className={styles.navLink}
          onClick={toggleTheme}
        >
          {theme === "dark" ? "Light Theme" : "Dark Theme"}
        </span>
        {user ? !isMobile&&(<UserMenu>
            <img 
              src={user.photo || defaultPicture} 
              alt="Profile" 
              className={styles.profilePic}
            />
          </UserMenu>
        ) : (
          <Link to="/login" className={styles.navLink} onClick={() => setIsOpen(false)}>Login</Link>
        )}
      </div>
    </nav>
    {user && (
      user.status === "deleted" ? (
        <div className={styles.notification}>
          <span>Your account is marked as deleted. You can recover it anytime within 5 hours.</span>
          <Link to="/edit-profile" className={styles.verifyLink}>Recover Account</Link>
        </div>
      ) : !user.hasEmail ? (
        <div className={styles.notification}>
          <span>Looks like you haven't linked an email with your Provenix account yet. Please update your profile to connect one.</span>
          <Link to="/edit-profile" className={styles.verifyLink}>Provide Email</Link>
        </div>
      ) : !user.verifiedEmail ? (
        <div className={styles.notification}>
          <span>Your email is not verified.</span>
          <Link to="/edit-profile" className={styles.verifyLink}>Verify Email</Link>
        </div>
      ) : null
    )}

    </>
  );
}

export default Navbar;
