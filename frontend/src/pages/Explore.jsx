import React from "react";
import VideoUpload from "../components/VideoUpload";

import MCQCard from "../components/MCQCard"; // Make sure path sahi ho


import Reviews from "../components/Reviews"; 

import CodeToggle from "../components/CodeToggle";


import ImageUpload from "../components/ImageUpload";

const Explore = () => {
  const sampleMCQ = {
    question: "What is 2 + 2?",
    options: ["1", "2", "4", "5"],
    correctAnswer: 2, // Index of correct answer
};

const sampleCode = `
function add(a, b) {
    return a + b;
}
console.log(add(2, 3));
`;

  return (
    <div>
      <h1>Explore Page</h1>
      <VideoUpload />
      <Reviews />
      <MCQCard {...sampleMCQ} />
      <CodeToggle codeSnippet={sampleCode} language="javascript" />


      <ImageUpload />
    </div>
  );
};

export default Explore;
