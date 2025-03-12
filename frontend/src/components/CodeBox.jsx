import React, { useState } from "react";
import styles from "../styles/CodeBox.module.css";

const CodeBox = ({ codeData }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeData[activeTab].data);
        alert("Code copied!");
    };

    const codeLines = codeData[activeTab].data.split("\n");

    return (
        <div className={styles.codeboxContainer}>
            {/* Tabs for Different Languages */}
            <div className={styles.codeboxTabs}>
                {codeData.map((code, index) => (
                    <button
                        key={index}
                        className={`${styles.codeboxTab} ${index === activeTab ? styles.active : ""}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {code.lang}
                    </button>
                ))}
            </div>

            {/* Code Display with Line Numbers */}
            <div className={styles.codeboxContent}>
                {/* Line Numbers */}
                <div className={styles.lineNumbers}>
                    {codeLines.map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                    ))}
                </div>

                {/* Actual Code */}
                <pre className={styles.codeboxLines}>
                    {codeLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                    ))}
                </pre>

                {/* Copy Button */}
                <button className={styles.copyBtn} onClick={handleCopy}>Copy</button>
            </div>
        </div>
    );
};

export default CodeBox;
