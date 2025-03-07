import React, { useState } from "react";
import "../styles/CodeToggle.css"; // Import CSS file

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
        <div className="code-toggle-container">
            <button onClick={handleToggle} className="code-toggle-btn">
                {isOpen ? "Hide Code" : "Show Code"}
            </button>
            {isOpen && (
                <div className="code-box">
                    <pre>
                        <code className={`language-${language}`}>{codeSnippet}</code>
                    </pre>
                    <button onClick={handleCopy} className="copy-btn">Copy</button>
                </div>
            )}
        </div>
    );
};

export default CodeToggle;
