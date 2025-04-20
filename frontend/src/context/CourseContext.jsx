import { createContext, useContext } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useCache } from "./CacheContext";

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    // const { courseId, moduleId } = useParams();
    const { getCache, setCache } = useCache();

    const fetchCourse = async (courseId) => {
        const cachedCourse = getCache(courseId);
        if (cachedCourse) return cachedCourse; // Return from cache if available
        try {
            const { data } = await axios.get(`/api/course/${courseId}`);
            setCache(courseId, data.course); // Store in cache
            toast.success(data.message);
            return data.course;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to load course");
            return null;
        }
    };
    

    const fetchModuleCollection = async (moduleCollectionId) => {
        const cachedMC=getCache(moduleCollectionId);
        if(cachedMC)return cachedMC;
        try {
            const { data } = await axios.get(`/api/course/module/${moduleCollectionId}/collection`);
            setCache(moduleCollectionId, data.moduleCollection);
            toast.success(data.message);
            return data.moduleCollection;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to load module collection");
            return null;
        }
    };

    const fetchPageCollection = async (pageCollectionId) => {
        const cachedPC=getCache(pageCollectionId);
        if(cachedPC)return cachedPC;
        try {
            const { data } = await axios.get(`/api/course/page/${pageCollectionId}/collection`);
            setCache(pageCollectionId, data.pageCollection);
            toast.success(data.message);
            return data.pageCollection;
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || "Failed to load page collection");
            return null;
        }
    };

    const fetchContentSection=async (contentSectionId)=>{
        const cachedCS=getCache(contentSectionId);
        if(cachedCS)return cachedCS;
        try {
            const { data } = await axios.get(`/api/course/content/${contentSectionId}/collection`);
            setCache(contentSectionId, data.contentSection);
            toast.success(data.message);
            return data.contentSection;
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || "Failed to load page Content");
            return null;
        }
    }
    return (
        <CourseContext.Provider value={{ fetchCourse, fetchModuleCollection, fetchPageCollection ,fetchContentSection}}>
            {children}
        </CourseContext.Provider>
    );
};

export function useCourse() {
    return useContext(CourseContext);
}
