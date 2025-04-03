import { Routes, Route ,Outlet} from "react-router-dom";
import CourseCreation from "../pages/CourseCreation";
import CourseView from "../pages/CourseView";
import ModuleList from '../pages/ModuleList.jsx'
import PageList from '../pages/PageList.jsx'
import MyCourses from "../pages/MyCourses";
import PageView from '../pages/PageView.jsx';
import CourseDetailForm from "../pages/CourseDetailForm";
import { CourseProvider } from "../context/CourseContext";
// Define CourseContextWrapper inside CourseRoutes
const CourseContextWrapper = () => (
    <CourseProvider>
      <Outlet />
    </CourseProvider>
  );
  
const CourseRoutes = () => {
  return (
    
      <Routes>
        <Route path='/my-courses' element={<MyCourses/>}/>
        <Route path='/create' element={<CourseCreation/>}/>
        <Route path="/:courseId" element={<CourseContextWrapper />}>
            <Route path='detail-form' element={<CourseDetailForm/>}/>
            <Route path='modules' element={<ModuleList/>}/> 
            <Route path='module/:pageCollectionId' element={<PageList/>}/>
            <Route path='module/:pageCollectionId/page/:contentSectionId' element={<PageView/>}/>
            <Route path='view' element={<CourseView/>}/>
        </Route>
      </Routes>
    
  );
};

export default CourseRoutes;
