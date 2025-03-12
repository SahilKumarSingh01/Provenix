import React, { useState } from "react";
import styles from "../styles/CodeToggle.module.css"; // Import CSS Module

const CodeToggle = ({ codeSnippet, language }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        alert("Code copied to clipboard!");
    };

    return (
        <div className={styles.codeToggleContainer}>
            <button onClick={handleToggle} className={styles.codeToggleBtn}>
                {isOpen ? "Hide Code" : "Show Code"}
            </button>
            {isOpen && (
                <div className={styles.codeBox}>
                    <pre>
                        <code className={`language-${language}`}>{codeSnippet}</code>
                    </pre>
                    <button onClick={handleCopy} className={styles.copyBtn}>Copy</button>
                </div>
            )}
        </div>
    );
};

export default CodeToggle;
