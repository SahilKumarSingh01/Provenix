import { useState } from "react";
import "./Login.css"; // Import the CSS file

function App() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", formData);
    // Send request to backend
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Provenix</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <div className="social-login">
          <p>Or login with:</p>
          <button className="google-btn">Login with Google</button>
          <button className="github-btn">Login with GitHub</button>
        </div>
      </div>
    </div>
  );
}

export default App;
