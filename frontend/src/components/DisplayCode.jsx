import React, { useState ,useRef,useEffect} from "react";
import { useEditingContent } from "../context/EditingContentContext";
import {toast} from 'react-toastify'
import ConfirmBox from "./ConfirmBox";
import styles from "../styles/CodeBox.module.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const DisplayCode = ({ item, index, contentSection, setContentSection }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);
    const [overlay,setOverlay]= useState(null);
    const codeRef = useRef(null);
    const {editingItem,editingState,setEditingItem,updateItemData,} = useEditingContent();

    const isEditing = editingItem === item;
    const codeData=isEditing?editingState.curData:item.data;
    if (!codeData[activeTab]) return <>loading...</>;

    const codeLines = codeData[activeTab].code.split('\n');
    useEffect(() => {
        const codeBlock=codeRef.current
        if ( codeBlock&& !isEditing) {
            codeRef.current.textContent = codeData[activeTab].code;
            codeRef.current.className = `language-${codeData[activeTab].lang || "plaintext"}`;
            codeRef.current.removeAttribute("data-highlighted");
            hljs.highlightElement(codeRef.current);
        }
      }, [isEditing, activeTab, codeData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeData[activeTab].code);
        setCopied(true);
        setTimeout(() => setCopied(false), 10000);
    };
    const handleDoubleClick = () => {
        if (!contentSection.isCreator) return;
        setEditingItem(contentSection, setContentSection, index);
    };
    const handleTab=(e)=>{
        if (e.key === "Tab") {
            e.preventDefault();
            const code=codeData[activeTab].code;
            const { selectionStart, selectionEnd } = e.target;
            const newValue = 
              code.substring(0, selectionStart) +
              "\t" +
              code.substring(selectionEnd);
            handleEditChange("code", newValue)
      
            // Set cursor after the tab
            setTimeout(() => {
              e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
            }, 0);
          }
    }
    const handleCreate  = ()=>{
        if(!isEditing)
            setEditingItem(contentSection, setContentSection, index);
        const updatedCD=[...codeData,{lang:"lang",code:"start code here..."}];
        updateItemData(updatedCD);
        setActiveTab(codeData.length);
    }

    const handleEditChange = (field, value) => {
        // setEditData((prev) => ({ ...prev, [field]: value }));
        const updatedCD=[...codeData];
        updatedCD[activeTab][field]=value;
        updateItemData(updatedCD);
    };

    const handleBlockRemove=(e)=>{
        if(codeData.length==1)
            return toast.error("Cannot remove the only remaining code block. Use the remove button above to delete the element.");
        const onConfirm=async()=>{
            const updatedCD=[...codeData];
            updatedCD.splice(activeTab, 1);
            updateItemData(updatedCD);
            setActiveTab(activeTab-1);
            setOverlay(null);
        }
        const onCancel=()=>{
            setOverlay(null);
        }
        const message=  `⚠️ Warning: This will permanently remove the selected code 
                             block from this element if you save it. Do you want to continue?`
        setOverlay(<ConfirmBox onConfirm={onConfirm} onCancel={onCancel} message={message}/>);
    }

    return (
        <div className={styles.codeboxContainer}>
            {/* Tabs */}
            {overlay}
            <div className={styles.codeboxTabs}>
                {codeData.map((code, index) => (
                    <button
                        key={index}
                        className={`${styles.codeboxTab} ${index === activeTab ? styles.active : ""}`}
                        onClick={() => setActiveTab(index)}
                        onDoubleClick={index === activeTab ? handleDoubleClick : undefined}
                    >
                        {isEditing && index === activeTab ? (
                        <>
                            <input
                                value={code.lang}
                                onChange={(e) => handleEditChange("lang", e.target.value)}
                                className={styles.tabInput}
                                autoFocus
                            />
                            <button
                            className={styles.removeTabBtn}
                            onClick={(e)=>handleBlockRemove(e)}
                            >
                                x
                            </button>
                        </>
                        ) : (

                            code.lang
                        )}
                    </button>
                ))}
                <button className={styles.addTabBtn} onClick={() => handleCreate()}>
                    ➕
                </button>
            </div>

            {/* Code Display */}
            <div className={styles.codeboxContent} onDoubleClick={handleDoubleClick}>
                <div className={styles.lineNumbers}>
                    {codeLines.map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                    ))}
                </div>

                {isEditing ? (
                    <textarea
                        wrap="off"
                        className={styles.codeEditor}
                        value={codeData[activeTab].code}
                        onChange={(e) => handleEditChange("code", e.target.value)}
                        onKeyDown={(e) => {handleTab(e)}}
                    />
                ) : (
                    <pre className={styles.codeboxLines}>
                        <code ref={codeRef}/>
                    </pre>
                )}

                <div className={styles.actions}>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                        {copied ? "✅ Copied!" : "📋 Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisplayCode;
