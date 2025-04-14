import { useNavigate } from "react-router-dom";
import styles from "../styles/BackspaceButton.module.css"; // Import CSS module

const BackspaceButton = ({ to }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to); // Navigate to provided URL
        } else {
            navigate(-1); // Go back one page if no URL is given
        }
    };

    return (
        <button onClick={handleClick} className={styles.backspaceButton}>
            ‹
        </button>
    );
};

export default BackspaceButton;
