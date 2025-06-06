import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Navbar from './components/Navbar';
import Login from "./pages/Login";
import {ToastContainer} from 'react-toastify'

import ProfileEditor from "./pages/ProfileEditor";

// import Search from "./pages/Search";

// import PrivacyPolicy from "./pages/PrivacyPolicy";

import Error404 from "./pages/Error404";

import Profile from './pages/Profile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Notification from "./pages/Notification.jsx";

import CourseRoutes from './routes/CourseRoutes.jsx';

import Signup from "./pages/Signup";
import EmailVerify from "./pages/EmailVerify"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from './pages/ResetPassword'
import {AuthProvider} from'./context/AuthContext.jsx';
import AccountDeletion from "./pages/AccountDeletion"
import Callback from "./pages/Callback.jsx"
import RazorpayAccountCreation from "./pages/RazorpayAccountForm.jsx";
import {CacheProvider} from'./context/CacheContext.jsx';
import RazorpayOrder from "./pages/RazorpayOrder.jsx";
import Payments from "./pages/Payments.jsx"
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
        style={{ marginTop: '4rem' }} // adjust based on your navbar height

      />
      <Routes>
        {/* public routes */}
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        {/* <Route path='/explore' element={<Editor/>}/> */}

        <Route path='/explore' element={<Explore/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/auth/google/callback' element={<Callback strategy="google" />} />
        <Route path='/auth/github/callback' element={<Callback strategy="github" />} />
        <Route path='/razorpay-order' element={<RazorpayOrder/>}/>
        <Route path='/payments/:enrollmentId' element={<Payments/>}/>
        <Route path="/course/*" element={<CourseRoutes />} />

        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/notification" element={<Notification/>}/>
        <Route path='/account-delete' element={<AccountDeletion/>}/>
        <Route path="/profile/:username" element={<Profile/>}/>
        <Route path='/edit-profile' element={<ProfileEditor/>}/>
        <Route path='/configure-razorpay-account' element={<RazorpayAccountCreation/>}/>
        
        <Route path='/*' element={<Error404/>}/>
      </Routes>
    </Router>
    </CacheProvider>
    </AuthProvider>
  );
}

export default App;
