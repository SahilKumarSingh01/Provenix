import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "../context/CourseContext";
import { EditingContentProvider, useEditingContent } from "../context/EditingContentContext";
import Sidebar from '../components/Sidebar.jsx';
import DisplayContents from "../components/DisplayContents";
import styles from "../styles/PageView.module.css";

const PageViewContent = () => {
  const { pageCollectionId, contentSectionId, courseId } = useParams();
  const { fetchPageCollection } = useCourse();
  const {clearEditingState} = useEditingContent();
  const navigate = useNavigate();

  const [pageTitle, setPageTitle] = useState("");
  const [pages, setPages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    const updatePage = async () => {
      clearEditingState();
      const fetchedPC = await fetchPageCollection(pageCollectionId);
      const pageIndex = fetchedPC.pages.findIndex(
        (page) => page.contentSection === contentSectionId
      );

      setPages(fetchedPC.pages || []);
      setCurrentIndex(pageIndex);
      setPageTitle(fetchedPC.pages[pageIndex]?.title || "Untitled Page");
    };

    updatePage();
  }, [pageCollectionId, contentSectionId]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      navigate(`/course/${courseId}/module/${pageCollectionId}/page/${pages[currentIndex - 1].contentSection}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      navigate(`/course/${courseId}/module/${pageCollectionId}/page/${pages[currentIndex + 1].contentSection}`);
    }
  };

  return (
    <>
      <Sidebar />
      <div className={styles.pageViewContainer}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <div className={styles.contentWrapper}>
          <DisplayContents contentSectionId={contentSectionId} />
        </div>

        {/* Buttons Section */}
        <div className={styles.actions}>
          <button className={styles.actionBtn}>Comments</button>

          <div className={styles.navButtons}>
            <button className={styles.actionBtn} onClick={handlePrev} disabled={currentIndex === 0}>
              Prev
            </button>
            <button className={styles.actionBtn} onClick={handleNext} disabled={currentIndex === pages.length - 1}>
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const PageView = () => (
  <EditingContentProvider>
    <PageViewContent />
  </EditingContentProvider>
);

export default PageView;
