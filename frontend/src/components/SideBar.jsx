import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useCourse } from "../context/CourseContext";
import styles from "../styles/Sidebar.module.css";

const Sidebar = () => {
  const { courseId } = useParams();
  const { fetchCourse, fetchModuleCollection, fetchPageCollection } = useCourse();
  
  const [courseTitle, setCourseTitle] = useState("");
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      const course = await fetchCourse(courseId);
      setCourseTitle(course.title);
      const moduleCollection = await fetchModuleCollection(course.moduleCollection);
      setModules(moduleCollection.modules);
    };
    fetchCourseData();
  }, [courseId]);

  const toggleModule = async (moduleId, pageCollectionId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));

    if (!expandedModules[moduleId]) {
      const pageData = await fetchPageCollection(pageCollectionId);
      setModules((prev) =>
        prev.map((mod) =>
          mod._id === moduleId ? { ...mod, pages: pageData.pages } : mod
        )
      );
    }
  };

  return (
    <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
      {/* Sidebar Toggle Button */}
      <button className={styles.toggleButton} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "⏴" : "⏵"}
      </button>

      <div className={styles.sidebarContent}>
        <div className={styles.courseTitle}>{courseTitle}</div>

        <div className={styles.moduleList}>
          {modules.map((module) => {
            const isExpanded = expandedModules[module._id];
            return (
              <div key={module._id}>
                <div
                  className={styles.moduleTitle}
                  onClick={() => toggleModule(module._id, module.pageCollection)}
                >
                  {isExpanded ? "⮟" : "➤"} {module.title}
                </div>

                {isExpanded && module.pages && (
                  <div className={styles.pageList}>
                    {module.pages.map((page) => (
                      <Link
                        key={page._id}
                        to={`/course/${courseId}/module/${module.pageCollection}/page/${page.contentSection}`}
                        className={styles.pageLink}
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
