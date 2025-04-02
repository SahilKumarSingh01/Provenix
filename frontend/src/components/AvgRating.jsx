import styles from "../styles/AvgRating.module.css"; // Import CSS module

const AvgRating = ({course}) => {
    if (course.numberOfRatings === 0) {
      return <span className={styles.RatingNumber}>Not Rated</span>;
    }
    const rating = Math.min(5, Math.max(0, course.totalRating / (course.numberOfRatings)));
    const filled = "★".repeat(Math.floor(rating));
    const empty = "★".repeat(5 - Math.floor(rating));
  
    return (
      <div className={styles.RatingWrapper}>
        <span className={styles.RatingCircles}>{<span style={{color:"gold"}}>{filled}</span>}{<span style={{color:"grey"}}>{empty}</span>}</span>
        <span className={styles.RatingNumber}>({course.numberOfRatings})</span>
      </div>
    );
  };

  export default AvgRating;