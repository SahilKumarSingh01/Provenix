import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Navbar from './components/Navbar';
import Login from "./pages/Login";
import {ToastContainer} from 'react-toastify'

import UpdateProfile from "./pages/UpdateProfile";

import Search from "./pages/Search";

import PrivacyPolicy from "./pages/PrivacyPolicy";

import Error404 from "./pages/Error404";



import CourseRoutes from './routes/CourseRoutes.jsx';

import Signup from "./pages/Signup";
import EmailVerify from "./pages/EmailVerify"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from './pages/ResetPassword'
import {AuthProvider} from'./context/AuthContext.jsx';

import {CacheProvider} from'./context/CacheContext.jsx';

// import Signup from "../pages/Signup";
import "./App.css";

function App() {
  return (
    <AuthProvider>
    <CacheProvider>
    <Router>
      <Navbar/>
      <ToastContainer
        position="top-right"
        autoClose={3000} // Close after 3 seconds
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Options: "light", "dark", "colored"
      />
      <Routes>
        {/* public routes */}
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        {/* <Route path='/explore' element={<Editor/>}/> */}
        <Route path='/explore' element={<Explore/>}/>
        <Route path='/login' element={<Login/>}/>
        {/* <Route path='/course-creation' element={<CourseCreation/>}/>
        <Route path='/my-courses' element={<MyCourses/>}/>
        <Route path='/course-detail-form' element={<CourseDetailForm/>}/>
        <Route path='/course-sections/:courseId' element={<SectionList/>}/> 
        <Route path='/course/:courseId/section-pages/:sectionId' element={<PageList/>}/>
        <Route path='/course-view/:courseId' element={<CourseView/>}/> */}


        <Route path="/course/*" element={<CourseRoutes />} />

        {/* <Route path="/courses/:courseId/">
            <Route index element={<CourseOverview />} />
            <Route path="pages" element={<PageList />} />
        </Route> */}



        <Route path='/*' element={<Error404/>}/>

        <Route path='/update-profile' element={<UpdateProfile/>}/>

        <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>

        <Route path='/search' element={<Search/>}/>




        <Route path='/signup' element={<Signup/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
      </Routes>
    </Router>
    </CacheProvider>
    </AuthProvider>
  );
}

export default App;
