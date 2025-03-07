// Error404.jsx
import '../styles/Error404.css'; // We'll create this next
import Footer from '../components/Footer'; // Your existing footer component

const Error404 = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-number">404</div>
        <div className="error-text">
          <h1 className="error-heading">Page not found</h1>
          <p className="error-message">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <a href="/" className="home-link">
            ← Return to homepage
          </a>
        </div>
        <div className="error-illustration">
          <div className="octocat">🐙</div> {/* You can replace with SVG */}
        </div>
      </div>
      <Footer /> {/* Include your existing footer */}
    </div>
  );
};

export default Error404;