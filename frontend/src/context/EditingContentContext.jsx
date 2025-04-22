import { createContext, useContext, useState } from 'react';
import ConfirmBox from "../components/ConfirmBox.jsx";
import styles from "../styles/EditingContentContext.module.css"; // add correct path
import {toast} from "react-toastify";
import { useCache } from "../context/CacheContext.jsx";
import axios from '../api/axios.js';

const EditingContentContext = createContext();

export const EditingContentProvider = ({ children }) => {
  const [editingState, setEditingState] = useState({
    contentSection: null,
    setContentSection:null,
    items: null,
    prevIndex: -1,
    curIndex: -1,
    prevData: null,
    curData: null,
  });
  const [overlay, setOverlay] = useState(null);
  const {setCache,getCache}=useCache();
  
  const editingItem=editingState.items?editingState.items[editingState.curIndex]:null;
  
  const updateItemData = (newData) => {
    setEditingState(prev => ({
      ...prev,
      curData: newData,
    }));
  };
  

  const clearEditingState = () => {
    if(!editingState.contentSection)return;
    setEditingState({
      contentSection: null,
      setContentSection:null,
      items: null,
      prevIndex: -1,
      curIndex: -1,
      prevData: null,
      curData: null,
    });
  };
  

  const save = async () => {
    try {
        const contentSection=editingState.contentSection;
        if(!contentSection)return ;
        let promises=[];
        const index=editingState.curIndex;
        if(!editingState.curData)
            return toast.warn("can't save it empty");
        if(editingState.prevData!==editingState.curData)
          promises.push(axios.put(`/api/course/content/${contentSection._id}/${editingItem.type}`,{
            courseId:contentSection.courseId,
            itemId:editingItem._id,
            data:editingState.curData,
          })
        )
        if(editingState.prevIndex!==editingState.curIndex)
          promises.push(axios.put(`/api/course/content/${contentSection._id}/reorder`,{
            oldIndex:editingState.prevIndex,
            newIndex:editingState.curIndex
          })
        )
        if(promises.length==0)
          return clearEditingState();; 
        const results=await Promise.all(promises);
        results.forEach((result)=>toast.success(result.data.message));
        const updatedSection={...contentSection,items:editingState.items,};
        updatedSection.items[index].data=editingState.curData;
        let updates={};
        if(results[0].data.codeCount)
          updates.codeCount=results[0].data.codeCount;
        if(results[0].data.videoCount)
          updates.videoCount=results[0].data.videoCount;
        //may use it save 
        const course=getCache(contentSection.courseId);
        if(course)
            setCache(course._id,{...course,...updates});
        console.log(updates);
        setCache(contentSection._id,updatedSection);
        editingState.setContentSection(updatedSection);
        clearEditingState();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to save changes");
    }
  };

  const remove = async () => {
    if (!editingState) return;
    const contentSection=editingState.contentSection;
    const onConfirm = async () => {
      try {
        const {data}=await axios.delete(`/api/course/content/${contentSection._id}/${editingItem.type}`,
          {params:{itemId:editingItem._id,courseId:contentSection.courseId}}
        );
        const updatedSection={...contentSection,items:data.items}
        let updates={};
        if(data.codeCount)
          updates.codeCount=data.codeCount;
        if(data.videoCount)
          updates.videoCount=data.videoCount;
        //may use it save 
        const course=getCache(contentSection.courseId);
        if(course)
            setCache(course._id,{...course,...updates});
        setCache(contentSection._id,updatedSection);
        editingState.setContentSection(updatedSection);
        toast.success(data.message);
        clearEditingState();
      } catch (e) {
        console.error(e);
        toast.error(e.response?.data?.message || "Failed to remove element");
      } finally {
        onCancel();
      }
    };

    const onCancel = () => setOverlay(null);

    const message = `Are you sure you want to delete this element? This action is not recoverable.
                Try editing it instead if you just want to make changes.`;


    setOverlay(<ConfirmBox onConfirm={onConfirm} onCancel={onCancel} message={message} />);
  };

  const shift = (direction) => {
    if (!editingState) return;
    const updatedItems = editingState.items;
    const index=editingState.curIndex;
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updatedItems.length) return;

    [updatedItems[index], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[index]];
    setEditingState({...editingState,items:updatedItems,curIndex:newIndex});
  };

  const setEditingItem = async (selectedCS,selectedSetCS, selectedIndex) => {
    if (editingState.curIndex !== -1 && editingState.curData) {
      await save(); // Save previous editing item if valid
    }
  
    const selItem = selectedCS.items[selectedIndex];
  
    setEditingState({
      contentSection: selectedCS,
      setContentSection:selectedSetCS,
      items: [...selectedCS.items],
      prevIndex: selectedIndex,
      curIndex: selectedIndex,
      prevData: selItem.data,
      curData: selItem.data,
    });
  };
  

  const EditMenuPanel = () => {
    if (!editingState.contentSection) return null;
    return (
      <>
      <div className={styles.editBox}>
        <button onClick={save} className={styles.actionButton}>✔ Save</button>
        <button onClick={clearEditingState} className={styles.actionButton}>✗ cancel</button>
        <button onClick={remove} className={styles.removeButton}>✗ Remove</button>
        <button onClick={() => shift("up")} className={styles.shiftButton}>⬆ Up</button>
        <button onClick={() => shift("down")} className={styles.shiftButton}>⬇ Down</button>
      </div>
      </>
    );
  };
  return (
    <EditingContentContext.Provider value={{ setEditingItem, updateItemData,clearEditingState, editingState,editingItem,saveEditing:save}}>
      {children}
      {overlay}
      <EditMenuPanel />
    </EditingContentContext.Provider>
  );
};

export const useEditingContent = () => useContext(EditingContentContext);
