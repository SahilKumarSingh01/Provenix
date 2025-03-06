import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Navbar from './components/Navbar';
import Login from "./pages/Login";
import CourseCreation from "./pages/CourseCreation";

import CourseDetailForm from "./pages/CourseDetailForm";


import Signup from "./pages/Signup";
import EmailVerify from "./pages/EmailVerify"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from './pages/ResetPassword'
import Editor from './pages/Editor.jsx'
import {AuthProvider} from'./context/AuthContext.jsx';

// import Signup from "../pages/Signup";
import "./App.css";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Navbar/>
      <Routes>
        {/* public routes */}
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        {/* <Route path='/explore' element={<Editor/>}/> */}
        <Route path='/explore' element={<Explore/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/course-creation' element={<CourseCreation/>}/>

        <Route path='/course-detailform' element={<CourseDetailForm/>}/>


        <Route path='/signup' element={<Signup/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
