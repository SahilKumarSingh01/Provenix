import React, { useState } from "react";
import styles from "../styles/MCQCard.module.css"; // Import the CSS module

const MCQCard = ({ question, options, correctAnswer }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleOptionClick = (index) => {
        if (!isSubmitted) {
            setSelectedOption(index);
        }
    };

    const handleSubmit = () => {
        if (selectedOption !== null) {
            setIsSubmitted(true);
        }
    };

    return (
        <div className={styles.mcqCard}>
            <h3 className={styles.mcqQuestion}>{question}</h3>
            <ul className={styles.mcqOptions}>
                {options.map((option, index) => (
                    <li
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        className={`${styles.mcqOption} 
                            ${isSubmitted && index === correctAnswer ? styles.correct : ""} 
                            ${isSubmitted && selectedOption === index && index !== correctAnswer ? styles.wrong : ""} 
                            ${!isSubmitted && selectedOption === index ? styles.selected : ""}
                        `}
                    >
                        {option}
                    </li>
                ))}
            </ul>
            {!isSubmitted ? (
                <button onClick={handleSubmit} disabled={selectedOption === null} className={styles.mcqSubmitBtn}>
                    Submit Answer
                </button>
            ) : (
                <p className={`${styles.mcqFeedback} ${selectedOption === correctAnswer ? styles.correct : styles.wrong}`}>
                    {selectedOption === correctAnswer ? "✅ Correct!" : "❌ Wrong Answer"}
                </p>
            )}
        </div>
    );
};

export default MCQCard;
