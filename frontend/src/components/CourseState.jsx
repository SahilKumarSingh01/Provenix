import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import styles from "../styles/StateCard.module.css";

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

const CourseState = () => {
  const [courseStats, setCourseStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const res = await axios.get("/api/course/stats");
        setCourseStats(res.data.stats);
      } catch (err) {
        console.error("Error fetching course stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStats();
  }, []);

  if (loading) return <div>Loading Course Stats...</div>;

  const generalStats = {
    "Total Courses": courseStats.totalCourses || 0,
    "Average Price": `₹${courseStats.averagePrice || 0}`,
    "Total Enrollment": courseStats.totalEnrollment || 0,
  };

  return (
    <div className={styles.stateCard}>
      <h3 className={styles.cardTitle}>My Created Courses</h3>
      <div className={styles.stats}>
        <StatBlock title="General Stats" data={generalStats} />
        <StatBlock title="Courses by Status" data={courseStats.statusCounts} />
        <StatBlock title="Courses by Level" data={courseStats.levelCounts} />
        <StatBlock title="Courses by Category" data={courseStats.categoryCounts} />
      </div>

      <Link
        to="/course/my-courses"
        onClick={(e) => e.stopPropagation()}
        className={styles.viewLink}
      >
        View My Created Courses
      </Link>
    </div>
  );
};

export default CourseState;
