import React, { useState } from "react";
import "../styles/CodeBox.css";

const CodeBox = ({ codeData }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeData[activeTab].data);
        alert("Code copied!");
    };

    const codeLines = codeData[activeTab].data.split("\n");

    return (
        <div className="codebox-container">
            {/* Tabs for Different Languages */}
            <div className="codebox-tabs">
                {codeData.map((code, index) => (
                    <button
                        key={index}
                        className={`codebox-tab ${index === activeTab ? "active" : ""}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {code.lang}
                    </button>
                ))}
            </div>

            {/* Code Display with Line Numbers */}
            <div className="codebox-content">
                {/* Line Numbers */}
                <div className="line-numbers">
                    {codeLines.map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                    ))}
                </div>

                {/* Actual Code */}
                <pre className="codebox-lines">
                    {codeLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                    ))}
                </pre>

                {/* Copy Button */}
                <button className="copy-btn" onClick={handleCopy}>Copy</button>
            </div>
        </div>
    );
};

export default CodeBox;
