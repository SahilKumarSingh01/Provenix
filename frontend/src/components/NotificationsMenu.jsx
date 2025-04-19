import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router
import MentionText from "../components/MentionText.jsx";
import styles from "../styles/NotificationsMenu.module.css";
import axios from "../api/axios";
import notificationIcon from '../assets/notificationIcon.png';  // Import the icon

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const navigate = useNavigate(); // To navigate to NotificationPage

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/profile/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    if (open && notifications.length === 0) {
      // fetchNotifications();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    fetchNotifications();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (index) => {
    // Navigate to the NotificationPage and pass the notificationId
    navigate("/notification", { state: { selectedNotification: index } });
  };
  return (
    <div className={styles.notificationWrapper} ref={menuRef}>
      <button className={styles.bellButton} onClick={() => setOpen(!open)}>
        <img src={notificationIcon} alt="Notifications" className={styles.icon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.notificationDropdown}>
          <h4 className={styles.notificationTitle}>Notifications</h4>
          {notifications.length === 0 ? (
            <p className={styles.emptyMsg}>No notifications yet</p>
          ) : (
            <ul className={styles.notificationList}>
              {notifications.map((n, index) => (
                <li
                  key={n._id}
                  className={`${styles.notificationItem} ${
                    n.read ? styles.read : styles.unread
                  }`}
                  onClick={() => handleNotificationClick(index)} // Pass notificationId
                >
                    {/* Render notification type dynamically */}
                    <div className={styles.notificationType}>
                      {n.type}{" "}{n.read?"":"◉"}
                      
                    </div>
                    <div className={styles.mentionText}>
                      {n.type === "comment" && <MentionText text={n.data.text} />}
                    </div>
                    <div className={styles.time}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
