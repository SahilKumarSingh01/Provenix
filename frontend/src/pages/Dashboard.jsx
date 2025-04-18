import React from "react";
import CourseState from "../components/CourseState.jsx";
import EnrollmentState from "../components/EnrollmentState.jsx";
import NotificationsMenu from "../components/NotificationsMenu.jsx";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Dashboard</h2>
        <NotificationsMenu />
      </div>

      <div className={styles.panelGrid}>
        <div className={styles.panelCard}>
          <CourseState />
        </div>
        <div className={styles.panelCard}>
          <EnrollmentState />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
