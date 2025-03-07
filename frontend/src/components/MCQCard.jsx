import React, { useState } from "react";
import "../styles/MCQCard.css"; // Import CSS file

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
        <div className="mcq-card">
            <h3 className="mcq-question">{question}</h3>
            <ul className="mcq-options">
                {options.map((option, index) => (
                    <li
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        className={`mcq-option 
                            ${isSubmitted && index === correctAnswer ? "correct" : ""} 
                            ${isSubmitted && selectedOption === index && index !== correctAnswer ? "wrong" : ""} 
                            ${!isSubmitted && selectedOption === index ? "selected" : ""}
                        `}
                    >
                        {option}
                    </li>
                ))}
            </ul>
            {!isSubmitted ? (
                <button onClick={handleSubmit} disabled={selectedOption === null} className="mcq-submit-btn">
                    Submit Answer
                </button>
            ) : (
                <p className={`mcq-feedback ${selectedOption === correctAnswer ? "correct" : "wrong"}`}>
                    {selectedOption === correctAnswer ? "✅ Correct!" : "❌ Wrong Answer"}
                </p>
            )}
        </div>
    );
};

export default MCQCard;
