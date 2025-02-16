import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
// import About from "./pages/About";
// import Explore from "./pages/Explore";
import Login from "./pages/Login";
// import Signup from "../pages/Signup";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1 className="logo">Provenix</h1>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/explore" className="nav-link">Explore</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/login" className="nav-link">Login</Link>
            {/* <Link to="/signup" className="nav-link">Sign Up</Link> */}
          </div>
        </nav>

        <div className="content">
          <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/login" element={<Login />} />
             {/* <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            //
            <Route path="/signup" element={<Signup />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
