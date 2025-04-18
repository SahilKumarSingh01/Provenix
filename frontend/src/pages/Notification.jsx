import { useState, useEffect } from "react";
import { useLocation ,Link } from "react-router-dom";
import styles from "../styles/Notification.module.css";
import axios from "../api/axios";
import MentionText from "../components/MentionText.jsx";

const Notification = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(location.state?.selectedNotification ?? 0);
  const [showLeftPane, setShowLeftPane] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/profile/notifications");
      const allNotifs = res.data.notifications || [];
      setNotifications(allNotifs);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };
  const markRead = async () => {
    try {
      const notification=notifications[selectedIndex];
      console.log("here is your",notification._id);
      await axios.patch("/api/profile/mark-read",{},{params:{notifId:notification._id}});
      const updatedNotifications=[...notifications];
      updatedNotifications[selectedIndex].read=true;
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error("Error in marking notification read", err);
    }
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setShowLeftPane(window.innerWidth > 768);
    };
    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    fetchNotifications();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if(notifications.length>selectedIndex&&!notifications[selectedIndex].read){
      markRead();
    }
  }, [selectedIndex,notifications]);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    if (isMobile) setShowLeftPane(false); // auto close on mobile
  };
  const capitalize = str => str[0].toUpperCase() + str.slice(1);
  const selectedNotification = notifications[selectedIndex];
  return (
    <div className={styles.notificationPageContainer}>
      {/* LEFT PANEL */}
      <div className={`${styles.leftPanel} ${isMobile && !showLeftPane ? styles.leftPaneHidden : ""}`}>
        <h3>All Notifications</h3>
        <ul className={`${styles.notificationList} ${isMobile ? styles.mobileList : ""}`}>
          {notifications.map((n, index) => (
            <li
              key={n._id}
              className={`${styles.notificationItem} ${n.read ? styles.read : styles.unread}`}
              onClick={() => handleNotificationClick(index)} // Pass notificationId
            >
              <div className={styles.notificationContent}>
                {/* Render notification type dynamically */}
                <div className={styles.notificationType}>
                  {n.type} {n.read ? "" : "◉"}
                </div>
                <div className={styles.mentionText}>
                  {n.type === "comment" && <MentionText text={n.data.text} />}
                </div>
                <span className={styles.time}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>

      </div>

      {/* TOGGLE BUTTON */}
      {isMobile&& (
        <button
          className={`${styles.toggleButton} ${showLeftPane ? styles.toggleShifted : ""}`}
          onClick={() => setShowLeftPane((prev) => !prev)}
        >
          {showLeftPane ? "⏴" : "⏵"}
        </button>
      )}

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel}>
        <h2>Notification Detail</h2>
        {selectedNotification ? (
          <div className={styles.notificationDetail}>
            <h3>
              {`${capitalize(selectedNotification.type)} Notification`}
            </h3>
            <p>
              {selectedNotification.type === "comment" && (
                <>
                 <MentionText text={selectedNotification.data.text} /> <br />
                 <Link to={selectedNotification.url}>click here</Link>
                 {/* {selectedNotification.url} */}
                  <span className={styles.time}>
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className={styles.loadingText}>Loading notification details... ⏳</div>
        )}
      </div>
    </div>
  );
};

export default Notification;
