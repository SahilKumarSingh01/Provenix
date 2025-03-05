import React from "react";

const Home = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to Provenix</h1>
      <p>This is a dummy home page.</p>
      <button onClick={() => alert("Button Clicked!")}>Click Me</button>
    </div>
  );
};

export default Home;
