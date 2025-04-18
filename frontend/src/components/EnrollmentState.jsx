import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/StateCard.module.css"; // Using the same StateCard styles

const StatBlock = ({ title, data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className={styles.block}>
      <div className={styles.blockTitle}>{title}</div>
      {Object.entries(data).map(([key, value]) => (
        <div className={styles.statItem} key={key}>
          <span className={styles.statKey} data-text={key}>{key}:</span>
          <span className={styles.statValue}>{value}</span>
        </div>
      ))}
    </div>
  );
};

const EnrollmentState = () => {
  const [enrollmentStats, setEnrollmentStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollmentStats = async () => {
      try {
        const res = await axios.get("/api/enrollment/stats");
        setEnrollmentStats(res.data.stats);
      } catch (err) {
        console.error("Error fetching enrollment stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentStats();
  }, []);

  if (loading) return <div>Loading Enrollment Stats...</div>;

  // Grouping the stats into objects similar to `StatBlock`
  const generalStats = {
    "Total Enrolled Courses": enrollmentStats.totalEnrolled || 0,
    "Average Progress": `${enrollmentStats.averageProgress || 0}%`,
  };

  return (
    <div className={styles.stateCard}>
      <h3 className={styles.cardTitle}>My Enrollment Stats</h3>
      <div className={styles.stats}>
        <StatBlock title="General Stats" data={generalStats} />
        <StatBlock title="Enrollment Status" data={enrollmentStats.statusCounts} />
        <StatBlock title="Enrollment by Level" data={enrollmentStats.levelCounts} />
        <StatBlock title="Paid vs Free Courses" data={enrollmentStats.paidVsFree} />
      </div>

      <Link
        to="/course/my-enrollments"
        onClick={(e) => e.stopPropagation()}
        className={styles.viewLink}
      >
        View My Enrolled Courses
      </Link>
    </div>
  );
};

export default EnrollmentState;
