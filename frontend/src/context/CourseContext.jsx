import { createContext, useContext } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useCache } from "./CacheContext";

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    const { courseId, moduleId } = useParams();
    const { getCache, setCache } = useCache();

    const fetchCourse = async () => {
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
    

    const fetchModuleCollection = async () => {
        const course = await fetchCourse();
        if (!course) return null;
        const moduleCollectionId = course.moduleCollection;
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

    const fetchPageCollection = async () => {
        const moduleCollection = await fetchModuleCollection();
        if (!moduleCollection) return null;
        const module = moduleCollection.modules.find(m => m._id === moduleId);
        if (!module) return null;
        const pageCollectionId=module.pageCollection;
        const cachedPC=getCache(pageCollectionId);
        if(cachedPC)return cachedPC;
        try {
            const { data } = await axios.get(`/api/course/page/${module.pageCollection}/collection`);
            const pageCollection={...data.pageCollection,moduleTitle:module.title}
            setCache(pageCollectionId, pageCollection);
            toast.success(data.message);
            return pageCollection;
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || "Failed to load page collection");
            return null;
        }
    };

    return (
        <CourseContext.Provider value={{ fetchCourse, fetchModuleCollection, fetchPageCollection }}>
            {children}
        </CourseContext.Provider>
    );
};

export function useCourse() {
    return useContext(CourseContext);
}
